import { Issue, Book, Student } from "../models/index.js";

//get all issues
export const getIssues = async function (req, res) {
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

  try {
    const issues = await Issue.findAll({
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
export const getIssueById = async function (req, res) {
  try {
    const issue = await Issue.findByPk(req.params.id, {
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

//create issue -> student issues a book
export const createIssue = async function (req, res) {
  const { bookId, studentId } = req.body;

  if (!bookId || !studentId) {
    return res
      .status(400)
      .json({ success: false, message: "Book and student are required" });
  }

  try {
    const book = await Book.findByPk(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const exists = await Issue.findOne({
      where: { bookId: bookId, status: "issued" },
      include: [{ model: Student, attributes: ["id", "name"] }],
    });

    console.log("exist student -> ", exists);

    if (exists) {
      const message =
        exists.studentId === Number(studentId)
          ? "This book is already issued to this student"
          : `This book is already issued to ${exists.Student.name}`;

      return res.status(400).json({ success: false, message: message });
    }

    const issue = await Issue.create({
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

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "This book is already issued",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//return issue book
export const returnIssue = async function (req, res) {
  try {
    const issue = await Issue.findByPk(req.params.id);

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
