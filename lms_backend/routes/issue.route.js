var express = require("express");
var { requireLogin, auth } = require("../middleware/auth");
var issueController = require("../controllers/issueController");
var router = express.Router();

router.get("/", requireLogin, issueController.getIssues);
router.get("/:id", requireLogin, issueController.getIssueById);
router.post("/", requireLogin, auth, issueController.createIssue);
router.put("/:id/return", requireLogin, auth, issueController.returnIssue);
router.delete("/:id", requireLogin, auth, issueController.deleteIssue);

module.exports = router;
