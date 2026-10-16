var express = require("express");
var { requireLogin } = require("../middleware/auth");
var pagesController = require("../controllers/pagesController");
var router = express.Router();

// var pages = [
//   "book-list.html",
//   "add-book.html",
//   "edit-book.html",
//   "student-list.html",
//   "add-student.html",
//   "issue-list.html",
//   "issue-book.html",
// ];

router.get("/", requireLogin, pagesController.home);
router.get("/book-list.html", requireLogin, pagesController.bookList);
router.get("/add-book.html", requireLogin, pagesController.addBook);
router.get("/edit-book.html", requireLogin, pagesController.editBook);
router.get("/student-list.html", requireLogin, pagesController.studentList);
router.get("/add-student.html", requireLogin, pagesController.addStudent);
router.get("/issue-list.html", requireLogin, pagesController.issueList);
router.get("/issue-book.html", requireLogin, pagesController.issueBook);

// pages.forEach(function (page) {
//   router.get("/" + page, requireLogin, pagesController.sendPage(page));
// });

module.exports = router;
