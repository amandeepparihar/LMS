var Book = require("../models/book.model");
var mailSender = require("../utils/mailSender.util");
var path = require("path");

async function sendBookMail(to, book) {
  var body = `
    <p><b>Book Name:</b> ${book.bookname}</p>
    <p><b>Author:</b> ${book.author}</p>
    <p><b>ISBN:</b> ${book.isbn}</p>
  `;

  var attachments = [];

  if (book.bookCover) {
    attachments.push({
      filename: book.bookCover,
      path: path.join(__dirname, "../public/uploads", book.bookCover),
    });
  }

  return mailSender(to, `New Book Added: ${book.bookname}`, body, attachments);
}

//getbooks
exports.getBooks = async function (req, res) {
  try {
    var books = await Book.findAll({ order: [["id", "ASC"]] });

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
exports.getBookById = async function (req, res) {
  try {
    var book = await Book.findByPk(req.params.id);

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
    res.status(500).json({ message: "Somthing went wrong" });
  }
};

//create book
exports.createBook = async function (req, res) {
  var bookCover = req.file ? req.file.filename : null;
  var bookname = req.body.bookname;
  var author = req.body.author;
  var isbn = req.body.isbn;

  if (!bookname || !author || !isbn) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    var exists = await Book.findOne({ where: { isbn: isbn } });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    var book = await Book.create({
      bookCover: bookCover,
      bookname: bookname,
      author: author,
      isbn: isbn,
    });

    sendBookMail(req.session.email, book).catch(function (mailError) {
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
exports.updateBook = async function (req, res) {
  var bookCover = req.file ? req.file.filename : null;
  var bookname = req.body.bookname;
  var author = req.body.author;
  var isbn = req.body.isbn;

  if (!bookname || !author || !isbn) {
    return res.status(400).json({
      message: "All fieldsare required",
    });
  }

  try {
    var book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    var exists = await Book.findOne({ where: { isbn: isbn } });

    if (exists && exists.id !== book.id) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    book.bookCover = bookCover;
    book.bookname = bookname;
    book.author = author;
    book.isbn = isbn;
    await book.save();

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
exports.deleteBook = async function (req, res) {
  try {
    var book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    await book.destroy();
    return res.json({
      success: true,
      message: "Book deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
