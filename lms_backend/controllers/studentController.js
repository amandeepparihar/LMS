import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { Student, Issue, sequelize } from "../models/index.js";
import { UPLOAD_DIR } from "../config/path.js";
import { Op } from "sequelize";

function removeUpload(filename) {
  if (!filename) {
    return;
  }

  fs.unlink(path.join(UPLOAD_DIR, filename), (err) => {
    if (err) {
      console.log("Error deleting Photo: ", err);
      return;
    }

    console.log("Photo deleted successfully");
  });
}

//getallStudents
export const getStudents = async function (req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const search = (req.query.search || "").trim();

    const sortable = ["id", "name", "rollno", "phoneno", "city"];
    const sortBy = sortable.includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { rollno: { [Op.iLike]: `%${search}%` } },
            { phoneno: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await Student.findAndCountAll({
      where: where,
      order: [[sortBy, order]],
      limit: limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: rows,
      meta: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//getStudent by id
export const getStudentById = async function (req, res) {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//create a student
export const createStudent = async function (req, res) {
  const { name, rollno, phoneno, country, state, city } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !rollno || !phoneno || !country || !state || !city) {
    removeUpload(photo);
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  ``;
  if (!photo) {
    return res
      .status(400)
      .json({ success: false, message: "Photo is required" });
  }

  try {
    const exists = await Student.findOne({ where: { rollno: rollno } });

    if (exists) {
      removeUpload(photo);
      return res.status(400).json({
        success: false,
        errField: "rollno",
        message: "Student with this roll number already exists",
      });
    }

    const phoneExists = await Student.findOne({
      where: { phoneno: phoneno },
    });

    if (phoneExists) {
      removeUpload(photo);
      return res.status(400).json({
        success: false,
        errField: "phoneno",
        message: "Student with this phone number already exists",
      });
    }

    const student = await Student.create({
      name: name,
      rollno: rollno,
      phoneno: phoneno,
      photo: photo,
      country: country,
      state: state,
      city: city,
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error(error.message);
    removeUpload(photo);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//edit a student
export const updateStudent = async function (req, res) {
  const photo = req.file ? req.file.filename : null;
  const { name, rollno, phoneno, country, state, city } = req.body;

  if (!name || !rollno || !phoneno || !country || !state || !city) {
    removeUpload(photo);
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      removeUpload(photo);
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const rollnoTaken = await Student.findOne({ where: { rollno: rollno } });

    if (rollnoTaken && rollnoTaken.id !== student.id) {
      removeUpload(photo);
      return res.status(400).json({
        success: false,
        message: "A student with this roll no already exists",
        errField: "rollno",
      });
    }

    const phoneTaken = await Student.findOne({ where: { phoneno: phoneno } });

    if (phoneTaken && phoneTaken.id !== student.id) {
      removeUpload(photo);
      return res.status(400).json({
        success: false,
        message: "A student with this phone no already exists",
        errField: "phoneno",
      });
    }

    const oldPhoto = student.photo;

    student.name = name;
    student.rollno = rollno;
    student.phoneno = phoneno;
    student.country = country;
    student.state = state;
    student.city = city;

    if (photo) {
      student.photo = photo;
    }

    await student.save();

    if (photo && oldPhoto) {
      removeUpload(oldPhoto);
    }

    return res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

//download the photo of a student
export const downloadStudentPhoto = async function (req, res) {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const filePath = path.join(UPLOAD_DIR, student.photo);

    if (!student.photo || !fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found" });
    }

    const ext = path.extname(student.photo);

    return res.download(filePath, `${student.rollno}${ext}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//export the student list to excel
export const exportStudents = async function (req, res) {
  try {
    const students = await Student.findAll({ order: [["id", "ASC"]] });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = [
      { header: "Id", key: "id", width: 8 },
      { header: "Student Name", key: "name", width: 25 },
      { header: "Roll No", key: "rollno", width: 15 },
      { header: "Phone No", key: "phoneno", width: 18 },
      { header: "Country", key: "country", width: 18 },
      { header: "State", key: "state", width: 18 },
      { header: "City", key: "city", width: 18 },
    ];

    sheet.getRow(1).font = { bold: true };

    students.forEach(function (student) {
      sheet.addRow({
        id: student.id,
        name: student.name,
        rollno: student.rollno,
        phoneno: student.phoneno,
        country: student.country,
        state: student.state,
        city: student.city,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//delete a student
export const deleteStudent = async function (req, res) {
  const t = await sequelize.transaction();

  try {
    const student = await Student.findByPk(req.params.id, { transaction: t });

    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    const active = await Issue.findOne({
      where: { studentId: student.id, status: "issued" },
      transaction: t,
    });

    if (active) {
      await t.rollback();
      return res.status(409).json({
        message: "Cannot delete a student who has books not returned yet",
      });
    }

    const photo = student.photo;

    //deleting history with the student
    await Issue.destroy({ where: { studentId: student.id }, transaction: t });
    await student.destroy({ transaction: t });

    await t.commit();
    removeUpload(photo);

    return res.json({
      success: true,
      message: "Student deleted successfully",
      data: null,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: "Something went wrong" });
  }
};
