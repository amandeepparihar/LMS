const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body, attachments) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"LMS" <no-reply@lms.com>',
      to: email,
      subject: title,
      html: body,
      attachments: attachments || [],
    });

    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.log("Error while sending mail");
    throw error;
  }
};

module.exports = mailSender;
