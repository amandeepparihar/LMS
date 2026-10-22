import fs, { link } from "node:fs";
import path from "node:path";
import { Book, Issue, sequelize, Student } from "../models/index.js";
import { UPLOAD_DIR } from "../config/path.js";
import mailSender from "../utils/mailSender.util.js";
import { Op } from "sequelize";
import { QueryTypes } from "sequelize";

async function sendBookMail(to, book) {
  const body = `
    <p><b>Book Name:</b> ${book.bookname}</p>
    <p><b>Author:</b> ${book.author}</p>
    <p><b>ISBN:</b> ${book.isbn}</p>
  `;

  const attachments = [];

  if (book.bookCover) {
    attachments.push({
      filename: book.bookCover,
      path: path.join(UPLOAD_DIR, book.bookCover),
    });
  }

  return mailSender(to, `New Book Added: ${book.bookname}`, body, attachments);
}

function removeUpload(filename) {
  if (!filename) {
    return;
  }

  fs.unlink(path.join(UPLOAD_DIR, filename), function () {});
}

//getbooks
export const getBooks = async function (req, res) {
  try {
    const search = (req.query.search || "").trim();

    const where = search
      ? {
          [Op.or]: [
            { bookname: { [Op.iLike]: `%${search}%` } },
            { author: { [Op.iLike]: `%${search}%` } },
            { isbn: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    //for dropdown
    if (req.path === "/all") {
      const data = await Book.findAll({
        where: where,
        attributes: ["id", "bookname"],
        order: [["bookname", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Books fetched successfully",
        data: data,
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const sortable = ["id", "bookname", "author", "isbn", "quantity"];
    const sortBy = sortable.includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const { rows, count } = await Book.findAndCountAll({
      where: where,
      order: [[sortBy, order]],
      limit: limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      data: rows,
      meta: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//getbook by id
export const getBookById = async function (req, res) {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json({
      success: true,
      message: "Book fetched successfully",
      data: book,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//create book
export const createBook = async function (req, res) {
  const bookCover = req.file ? req.file.filename : null;
  const { bookname, author, isbn, quantity } = req.body;

  if (!bookname || !author || !isbn || !quantity) {
    removeUpload(bookCover);
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const exists = await Book.findOne({ where: { isbn: isbn } });

    if (exists) {
      removeUpload(bookCover);
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

    const book = await Book.create({
      bookCover: bookCover,
      bookname: bookname,
      author: author,
      isbn: isbn,
      quantity: quantity,
    });

    sendBookMail(req.user.email, book).catch(function (mailError) {
      console.error("Mail failed:", mailError.message);
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//update book
export const updateBook = async function (req, res) {
  const bookCover = req.file ? req.file.filename : null;
  const { bookname, author, isbn, quantity } = req.body;

  if (!bookname || !author || !isbn || !quantity) {
    removeUpload(bookCover);
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      removeUpload(bookCover);
      return res.status(404).json({ message: "Book not found" });
    }

    const exists = await Book.findOne({ where: { isbn: isbn } });

    if (exists && exists.id !== book.id) {
      removeUpload(bookCover);
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    if (quantity !== undefined) {
      const issuedCount = await Issue.count({
        where: { bookId: book.id, status: "issued" },
      });

      // console.log("issuesCount -> ", issuedCount);

      if (Number(quantity) < issuedCount) {
        removeUpload(bookCover);
        return res.status(400).json({
          message: `${issuedCount} copies are currently issued`,
          errField: "quantity",
        });
      }

      book.quantity = Number(quantity);
    }

    const oldCover = book.bookCover;

    book.bookname = bookname;
    book.author = author;
    book.isbn = isbn;

    if (bookCover) {
      book.bookCover = bookCover;
    }

    await book.save();

    if (bookCover && oldCover) {
      removeUpload(oldCover);
    }

    return res.json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//deletebook
export const deleteBook = async function (req, res) {
  const t = await sequelize.transaction();

  try {
    const book = await Book.findByPk(req.params.id, { transaction: t });

    if (!book) {
      await t.rollback();
      return res.status(404).json({ message: "Book not found" });
    }

    const active = await Issue.findOne({
      where: { bookId: book.id, status: "issued" },
      transaction: t,
    });

    if (active) {
      await t.rollback();
      return res.status(409).json({
        message: "Cannot delete a book that is currently issued",
      });
    }

    const cover = book.bookCover;

    //deleing history with the book
    await Issue.destroy({ where: { bookId: book.id }, transaction: t });
    await book.destroy({ transaction: t });

    await t.commit();
    removeUpload(cover);

    return res.json({
      success: true,
      message: "Book deleted successfully",
      data: null,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//book issued to
export const getIssuedBooks = async function (req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const search = (req.query.search || "").trim();

    const sortable = {
      id: "b.id",
      bookname: "b.bookname",
      quantity: "b.quantity",
      issueCount: '"issueCount"',
      total_students: "total_students",
    };
    const sortBy = sortable[req.query.sortBy] || "b.id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const rows = await sequelize.query(
      `SELECT b.id,
              b.bookname,
              b.quantity,
              COUNT(i."bookId")::int AS "issueCount",
              (COUNT(DISTINCT i."studentId")
                 FILTER (WHERE i.issuedate < NOW() - interval '3 days'))::int AS total_students
         FROM books b
         JOIN issues i ON b.id = i."bookId"
        WHERE i.status = 'issued'
          AND (:search = '' OR b.bookname ILIKE :like)
        GROUP BY b.id, b.bookname, b.quantity
        ORDER BY ${sortBy} ${order}
        LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          search: search,
          like: `%${search}%`,
          limit: limit,
          offset: (page - 1) * limit,
        },
        type: QueryTypes.SELECT,
      },
    );

    const [{ total }] = await sequelize.query(
      `SELECT COUNT(DISTINCT i."bookId")::int AS total
         FROM issues i
         JOIN books b ON b.id = i."bookId"
        WHERE i.status = 'issued'
          AND (:search = '' OR b.bookname ILIKE :like)`,
      {
        replacements: { search: search, like: `%${search}%` },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: rows,
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//this book issued students
export const getStuNameofIssuedBooks = async function (req, res) {
  const bookId = Number(req.params.id);

  if (!Number.isInteger(bookId)) {
    return res.status(400).json({ success: false, message: "Invalid book id" });
  }

  try {
    const data = await sequelize.query(
      `SELECT i.id,
              i.issuedate,
              s.id     AS "studentId",
              s.name,
              s.rollno
         FROM issues i
         JOIN students s ON s.id = i."studentId"
        WHERE i."bookId" = :bookId
          AND i.status = 'issued'
        ORDER BY i.issuedate DESC`,
      {
        replacements: { bookId: bookId },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//fine students
export const getFineStuCountByBookId = async function (req, res) {
  const bookId = Number(req.params.id);

  if (!Number.isInteger(bookId)) {
    return res.status(400).json({ success: false, message: "Invalid book id" });
  }
  try {
    const data = await sequelize.query(
      `select
            s.id,
            s."name",
            s.rollno,
            i."issuedate",
             COUNT(distinct "studentId") as total_students
        from issues i join students s on i."studentId" = s.id 
        where i.status = 'issued'
	      and i."issuedate" < NOW() - interval '3 days'
        and i."bookId" = :bookId
        group by s.id, s."name", s.rollno, i."issuedate"`,
      {
        replacements: { bookId: bookId },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      success: true,
      message: "fetched successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//book by date
export const getBookbyDateRange = async function (req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  try {
    const { dateOne, dateTwo } = req.query;

    if (!dateOne && !dateTwo) {
      return res.status(400).json({
        success: false,
        message: "Both date required!",
      });
    }
    // console.log("dateOne -> ", dateOne);
    // console.log("dateTwo -> ", dateTwo);
    const sortable = {
      bookId: "i.bookId",
      bookname: "b.bookname",
      no_of_times_i: "no_of_times_i",
      no_of_times_r: "no_of_times_r",
    };

    const sortBy = sortable[req.query.sortBy] || "b.id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const data = await sequelize.query(
      `select
        i."bookId",
        b.bookname ,
        count(case when i.status = 'issued' then 1 end) as no_of_times_i,
	      count(case when i.status = 'returned' then 1 end) as no_of_times_r
      from
        issues i
      join books b on
        i."bookId" = b.id
      where
        i."issuedate"::date between :dateOne::date and :dateTwo::date
      group by
        i."bookId",
        b.bookname ,
        b.id
        ORDER BY ${sortBy} ${order}
        LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          dateOne: dateOne,
          dateTwo: dateTwo,
          limit: limit,
          offset: (page - 1) * limit,
        },
        type: QueryTypes.SELECT,
      },
    );

    // console.log("data - > ", data);

    const [{ total }] = await sequelize.query(
      `SELECT COUNT(DISTINCT i."bookId")::int AS total
         FROM issues i
        WHERE i."issuedate"::date between :dateOne::date and :dateTwo::date`,
      {
        replacements: { dateOne: dateOne, dateTwo: dateTwo },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: data,
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
