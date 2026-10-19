import "dotenv/config";
import express from "express";
import cors from "cors";
import { UPLOAD_DIR } from "./config/path.js";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import bookRoutes from "./routes/book.route.js";
import issueRoutes from "./routes/issue.route.js";
import studentRoutes from "./routes/student.route.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: true, limit: "1kb" }));

// book covers and student photos are served from here
app.use("/uploads", express.static(UPLOAD_DIR));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/students", studentRoutes);

const start = async function () {
  try {
    await connectDb();

    app.listen(PORT, function () {
      console.log(`Server listening on PORT : ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
