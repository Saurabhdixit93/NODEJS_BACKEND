const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const createMailOptions = (email, subject, html, from) => {
  const mailOptions = {
    from: from,
    to: email,
    subject: subject,
    html: html,
  };

  return mailOptions;
};

module.exports = {
  createMailOptions,
  transporter,
};
