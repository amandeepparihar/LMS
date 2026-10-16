var { Issue, Book, Student } = require("../models");

//get all issues
exports.getIssues = async function (req, res) {
  var where = {};

  if (req.query.bookId) {
    where.bookId = req.query.bookId;
  }

  if (req.query.studentId) {
    where.studentId = req.query.studentId;
  }

  try {
    var issues = await Issue.findAll({
      where: where,
      include: [
        { model: Book, attributes: ["id", "bookname", "isbn"] },
        { model: Student, attributes: ["id", "name", "rollno"] },
      ],  
      order: [["id", "ASC"]],
    });

    return res.json({
      success: true,
      message: "Issues fetched successfully",
      data: issues,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//get issue by id
exports.getIssueById = async function (req, res) {
  try {
    var issue = await Issue.findByPk(req.params.id, {
      include: [
        { model: Book, attributes: ["id", "bookname", "isbn"] },
        { model: Student, attributes: ["id", "name", "rollno"] },
      ],
    });

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    return res.json({
      success: true,
      message: "Issue fetched successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//create issue
exports.createIssue = async function (req, res) {
  var bookId = req.body.bookId;
  var studentId = req.body.studentId;

  if (!bookId || !studentId) {
    return res
      .status(400)
      .json({ success: false, message: "Book and student are required" });
  }

  try {
    var book = await Book.findByPk(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    var student = await Student.findByPk(studentId);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    var exists = await Issue.findOne({
      where: { bookId: bookId, studentId: studentId, status: "issued" },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This book is already issued to this student",
      });
    }

    var issue = await Issue.create({
      bookId: bookId,
      studentId: studentId,
    });

    return res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//return issue book
exports.returnIssue = async function (req, res) {
  try {
    var issue = await Issue.findByPk(req.params.id);

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    if (issue.status === "returned") {
      return res
        .status(400)
        .json({ success: false, message: "This book is already returned" });
    }

    issue.status = "returned";
    issue.returndate = new Date();
    await issue.save();

    return res.json({
      success: true,
      message: "Book returned successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//delete issue
exports.deleteIssue = async function (req, res) {
  try {
    var issue = await Issue.findByPk(req.params.id);

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
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
