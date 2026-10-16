import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Student = sequelize.define(
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

export default Student;
