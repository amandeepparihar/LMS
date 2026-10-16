import express from "express";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import * as studentController from "../controllers/studentController.js";

const router = express.Router();

router.get("/", auth, studentController.getStudents);
router.get("/export", auth, studentController.exportStudents);
router.get("/:id", auth, studentController.getStudentById);
router.get("/:id/photo", auth, studentController.downloadStudentPhoto);
router.post("/", auth, upload.single("photo"), studentController.createStudent);
router.delete("/:id", auth, studentController.deleteStudent);

export default router;
