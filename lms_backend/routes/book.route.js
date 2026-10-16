var express = require("express");
var { requireLogin, auth } = require("../middleware/auth");
var bookController = require("../controllers/bookController");
const upload = require("../middleware/upload");
var router = express.Router();

router.get("/", requireLogin, bookController.getBooks);
router.get("/:id", requireLogin, bookController.getBookById);
router.post(
  "/",
  requireLogin,
  auth,
  upload.single("bookCover"),
  bookController.createBook,
);

router.put(
  "/:id",
  requireLogin,
  auth,
  upload.single("bookCover"),
  bookController.updateBook,
);

router.delete("/:id", requireLogin, auth, bookController.deleteBook);

module.exports = router;
