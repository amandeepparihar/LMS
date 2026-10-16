var { sequelize } = require("../config/db");
var User = require("./user.model");
var Book = require("./book.model");
var Student = require("./student.model");
var Issue = require("./issue.model");

Book.hasMany(Issue, { foreignKey: "bookId" });
Issue.belongsTo(Book, { foreignKey: "bookId" });

Student.hasMany(Issue, { foreignKey: "studentId" });
Issue.belongsTo(Student, { foreignKey: "studentId" });

module.exports = { sequelize, User, Book, Student, Issue };
