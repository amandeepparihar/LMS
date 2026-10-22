import express from "express";
import { auth } from "../middleware/auth.js";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

router.get("/:id", auth, bookController.getFineStuCountByBookId);

export default router;
