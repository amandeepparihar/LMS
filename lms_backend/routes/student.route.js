var express = require("express");
var { requireLogin, auth } = require("../middleware/auth");
var studentController = require("../controllers/studentController");
const upload = require("../middleware/upload");
var router = express.Router();

router.get("/", requireLogin, studentController.getStudents);
router.get("/:id", requireLogin, studentController.getStudentById);

router.post(
  "/",
  requireLogin,
  auth,
  upload.single("photo"),
  studentController.createStudent,
);

// router.put(
//   "/:id",
//   requireLogin,
//   upload.single("photo"),
//   studentController.updateStudent,
// );

router.delete("/:id", requireLogin, auth, studentController.deleteStudent);

module.exports = router;
