var { Sequelize } = require("sequelize");
require("dotenv").config();

var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
);

var connectDB = async function () {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync();
    console.log("Database tables synchronized!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
