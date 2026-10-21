import express from "express";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

router.get("/", auth, bookController.getBooks);
router.get("/:id", auth, bookController.getBookById);
router.post("/", auth, upload.single("bookCover"), bookController.createBook);
router.put("/:id", auth, upload.single("bookCover"), bookController.updateBook);
router.delete("/:id", auth, bookController.deleteBook);
// router.get("/", auth, bookController.getIssuedBooks);

export default router;
