var { DataTypes } = require("sequelize");
var { sequelize } = require("../config/db");

var Student = sequelize.define(
  "Student",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rollno: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phoneno: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "students",
    timestamps: true,
  },
);

module.exports = Student;
