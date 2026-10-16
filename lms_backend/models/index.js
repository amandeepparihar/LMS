import { sequelize } from "../config/db.js";
import User from "./user.model.js";
import Book from "./book.model.js";
import Student from "./student.model.js";
import Issue from "./issue.model.js";

// issues
Book.hasMany(Issue, { foreignKey: "bookId", onDelete: "RESTRICT" });
Issue.belongsTo(Book, { foreignKey: "bookId" });

Student.hasMany(Issue, { foreignKey: "studentId", onDelete: "RESTRICT" });
Issue.belongsTo(Student, { foreignKey: "studentId" });

export const syncDb = async ({ alter = false } = {}) => {
  await sequelize.sync({ alter });
  console.log("Models synced");
};

export { sequelize, User, Book, Student, Issue };
