import fs from "node:fs";
import path from "node:path";
import { Book } from "../models/index.js";
import { UPLOAD_DIR } from "../config/path.js";
import mailSender from "../utils/mailSender.util.js";

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
    const books = await Book.findAll({ order: [["id", "ASC"]] });

    return res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Something went wrong",
    });
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
  const { bookname, author, isbn } = req.body;

  if (!bookname || !author || !isbn) {
    removeUpload(bookCover);
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const exists = await Book.findOne({ where: { isbn: isbn } });

    if (exists) {
      removeUpload(bookCover);
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    const book = await Book.create({
      bookCover: bookCover,
      bookname: bookname,
      author: author,
      isbn: isbn,
      quantity: 1,
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
  const bookname = req.body.bookname;
  const author = req.body.author;
  const isbn = req.body.isbn;

  if (!bookname || !author || !isbn) {
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

    const oldCover = book.bookCover;

    book.bookname = bookname;
    book.author = author;
    book.isbn = isbn;

    // only replace the cover when a new file was uploaded
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
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const cover = book.bookCover;

    await book.destroy();
    removeUpload(cover);

    return res.json({
      success: true,
      message: "Book deleted successfully",
      data: null,
    });
  } catch (error) {
    // console.log("error -> ", error);
    console.error(error.message);

    if (error.original.constraint === "issues_bookId_fkey") {
      return res.status(409).json({
        message: "Cannot delete a book that has been issued",
      });
    }

    res.status(500).json({ message: "Something went wrong" });
  }
};
