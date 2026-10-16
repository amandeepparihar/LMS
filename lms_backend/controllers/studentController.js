var Student = require("../models/student.model");

//getallStudents
exports.getStudents = async function (req, res) {
  try {
    var students = await Student.findAll({ order: [["id", "ASC"]] });

    res.json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//getStudent by id
exports.getStudentById = async function (req, res) {
  try {
    var student = await Student.findByPk(req.params.id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//create a student
exports.createStudent = async function (req, res) {
  var name = req.body.name;
  var rollno = req.body.rollno;
  var phoneno = req.body.phoneno;
  var photo = req.file ? req.file.filename : null;
  var country = req.body.country;
  var state = req.body.state;
  var city = req.body.city;

  // console.log("req.file -> ",req.file);

  if (!name || !rollno || !phoneno || !country || !state || !city) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    var exists = await Student.findOne({ where: { rollno: rollno } });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll no already exists",
      });
    }

    var student = await Student.create({
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
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// update a student
// exports.updateStudent = async function (req, res) {
//   var name = req.body.name;
//   var rollno = req.body.rollno;
//   var phoneno = req.body.phoneno;
//   var photo = req.file ? req.file.filename : null;
//   var country = req.body.country;
//   var state = req.body.state;
//   var city = req.body.city;

//   if (!name || !rollno || !phoneno || !country || !state || !city) {
//     return res
//       .status(400)
//       .json({ success: false, message: "All fields are required" });
//   }

//   try {
//     var student = await Student.findByPk(req.params.id);

//     if (!student) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     var exists = await Student.findOne({ where: { rollno: rollno } });

//     if (exists && exists.id !== student.id) {
//       return res.status(400).json({
//         success: false,
//         message: "Student with this roll no already exists",
//       });
//     }

//     student.name = name;
//     student.rollno = rollno;
//     student.phoneno = phoneno;
//     student.photo = photo;
//     student.country = country;
//     student.state = state;
//     student.city = city;
//     await student.save();

//     res.json({
//       success: true,
//       message: "Student updated successfully",
//       data: student,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, message: "Something went wrong" });
//   }
// };

//delete a student
exports.deleteStudent = async function (req, res) {
  try {
    var student = await Student.findByPk(req.params.id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    await student.destroy();

    res.json({
      success: true,
      message: "Student deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
