import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { UPLOAD_DIR } from "../config/path.js";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9]/g, "_");

    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.indexOf(ext) === -1) {
    return cb(new Error("Only image files are allowed"));
  }

  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export default upload;
