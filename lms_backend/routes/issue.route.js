import express from "express";
import { auth } from "../middleware/auth.js";
import * as issueController from "../controllers/issueController.js";

const router = express.Router();

router.get("/", auth, issueController.getIssues);
router.get("/:id", auth, issueController.getIssueBySidBid);
router.post("/", auth, issueController.createIssue);
router.put("/:id/return", auth, issueController.returnIssue);
router.delete("/:id", auth, issueController.deleteIssue);

export default router;
