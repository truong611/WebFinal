require("dotenv").config();
const nodeMailer = require("nodemailer");

const sendMail = (to, text) => {
  var transport = nodeMailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e3519dda0efa6f",
      pass: "454e9405b11c8b",
    },
  });

  const options = {
    from: "staff@email.com",
    to: to,
    subject: "Automatic messages",
    text: text,
  };

  return transport.sendMail(options);
};

module.exports = {
  sendMail: sendMail,
};
