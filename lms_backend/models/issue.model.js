var { DataTypes } = require("sequelize");
var { sequelize } = require("../config/db");

var Issue = sequelize.define(
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
  },
);

module.exports = Issue;
