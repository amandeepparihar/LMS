//home page
exports.home = function (req, res) {
  res.redirect("/book-list.html");
};

// //get a page
// exports.sendPage = function (page) {
//   return function (req, res) {
//     res.sendFile(path.join(__dirname, '..', 'html', page));
//   };
// };

//get booklist
exports.bookList = function (req, res) {
  res.render("book-list", {
    title: "Book List",
    active: "books",
    name: req.session.name,
    script: "book-list.js",
  });
};

//add book
exports.addBook = function (req, res) {
  res.render("add-book", {
    title: "Add Book",
    active: "books",
    name: req.session.name,
    script: "add-book.js",
  });
};

//edit book
exports.editBook = function (req, res) {
  res.render("edit-book", {
    title: "Edit Book",
    active: "books",
    name: req.session.name,
    script: "edit-book.js",
  });
};

//get student list
exports.studentList = function (req, res) {
  res.render("student-list", {
    title: "Student List",
    active: "students",
    name: req.session.name,
    script: "student-list.js",
  });
};

//add student
exports.addStudent = function (req, res) {
  res.render("add-student", {
    title: "Add Student",
    active: "students",
    name: req.session.name,
    script: "add-student.js",
  });
};

//get issue list
exports.issueList = function (req, res) {
  res.render("issue-list", {
    title: "Issue List",
    active: "issues",
    name: req.session.name,
    script: ["issue-list.js", "issue-filters.js"],
  });
};

//issue book
//issue book
exports.issueBook = function (req, res) {
  res.render("issue-book", {
    title: "Issue Book",
    active: "issues",
    name: req.session.name,
    script: ["issue-book.js", "issue-filters.js"],
  });
};
