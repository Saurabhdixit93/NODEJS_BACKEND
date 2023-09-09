const { transporter, createMailOptions } = require("../utils/nodemail");

const sendEmail = async (email, subject, html, from) => {
  const mailOptions = createMailOptions(email, subject, html, from);
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
