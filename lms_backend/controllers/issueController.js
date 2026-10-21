import { Issue, Book, Student, sequelize } from "../models/index.js";

//get all issues
//get all issues
export const getIssues = async function (req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  const where = {};

  if (req.query.bookId) {
    where.bookId = req.query.bookId;
  }

  if (req.query.studentId) {
    where.studentId = req.query.studentId;
  }

  if (req.query.status) {
    where.status = req.query.status;
  }

  const sortable = ["id", "issuedate", "returndate", "status"];
  const sortBy = req.query.sortBy || "id";
  const order = req.query.order === "asc" ? "ASC" : "DESC";

  let orderClause;

  if (sortBy === "book") {
    orderClause = [[Book, "bookname", order]];
  } else if (sortBy === "student") {
    orderClause = [[Student, "name", order]];
  } else {
    orderClause = [[sortable.includes(sortBy) ? sortBy : "id", order]];
  }

  try {
    const { rows, count } = await Issue.findAndCountAll({
      where: where,
      include: [
        { model: Book, attributes: ["id", "bookname", "isbn"] },
        { model: Student, attributes: ["id", "name", "rollno"] },
      ],
      order: orderClause,
      limit: limit,
      offset: (page - 1) * limit,
      subQuery: false,
      distinct: true,
    });

    return res.json({
      success: true,
      message: "Issues fetched successfully",
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
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//get issue by id
export const getIssueBySidBid = async function (req, res) {
  try {
    const { bookId, studentId } = req.query;

    const where = {};
    if (bookId) {
      where.bookId = bookId;
    }
    if (studentId) {
      where.studentId = studentId;
    }

    const issues = await Issue.findAll({
      where: where,
      include: [
        { model: Book, attributes: ["id", "bookname", "isbn"] },
        { model: Student, attributes: ["id", "name", "rollno"] },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      message: "Issue fetched successfully",
      data: issues,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//create issue -> student issues a book
export const createIssue = async function (req, res) {
  const { bookId, studentId } = req.body;

  if (!bookId || !studentId) {
    return res
      .status(400)
      .json({ success: false, message: "Book and student are required" });
  }

  const t = await sequelize.transaction();

  try {
    // lock the book row so two requests can't both grab the last copy
    const book = await Book.findByPk(bookId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!book) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const student = await Student.findByPk(studentId, { transaction: t });

    if (!student) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const already = await Issue.findOne({
      where: { bookId: bookId, studentId: studentId, status: "issued" },
      transaction: t,
    });

    if (already) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "This book is already issued to this student",
      });
    }

    if (book.quantity <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "No copies available",
        errField: "bookId",
      });
    }

    const issue = await Issue.create(
      {
        bookId: bookId,
        studentId: studentId,
        issuedate: new Date(),
        status: "issued",
      },
      { transaction: t },
    );

    book.quantity = book.quantity - 1;
    await book.save({ transaction: t });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: issue,
    });
  } catch (error) {
    await t.rollback();
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//return issue book
export const returnIssue = async function (req, res) {
  const t = await sequelize.transaction();

  try {
    const issue = await Issue.findByPk(req.params.id, { transaction: t });

    if (!issue) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    if (issue.status === "returned") {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "This book is already returned" });
    }

    issue.status = "returned";
    issue.returndate = new Date();
    await issue.save({ transaction: t });

    const book = await Book.findByPk(issue.bookId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (book) {
      book.quantity = book.quantity + 1;
      await book.save({ transaction: t });
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Book returned successfully",
      data: issue,
    });
  } catch (error) {
    await t.rollback();
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//delete issue
export const deleteIssue = async function (req, res) {
  try {
    const issue = await Issue.findByPk(req.params.id);

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    if (issue.status === "issued") {
      return res.status(400).json({
        success: false,
        message: "Can not delete the issue as the book is not returned",
      });
    }

    await issue.destroy();

    return res.json({
      success: true,
      message: "Issue deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
