var multer = require("multer");
var path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

function fileFilter(req, file, cb) {
  var allowed = [".jpg", ".jpeg", ".png"];
  var ext = path.extname(file.originalname).toLowerCase();

  if (allowed.indexOf(ext) === -1) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
}

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
