import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Issue = sequelize.define(
  "Issue",
  {
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issuedate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    returndate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("issued", "returned"),
      allowNull: false,
      defaultValue: "issued",
    },
  },
  {
    tableName: "issues",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["bookId"],
        where: { status: "issued" },
        name: "issues_active_book_unique",
      },
    ],
  },
);

export default Issue;
