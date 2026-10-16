import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Book = sequelize.define(
  "Book",
  {
    bookCover: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bookname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "books",
    timestamps: true,
  },
);

export default Book;
