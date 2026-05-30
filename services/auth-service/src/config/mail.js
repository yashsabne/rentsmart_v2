import nodemailer from "nodemailer";

throw new Error("MAIL_JS_TEST");

 console.log("MAIL.JS LOADED MAIL.JS LOADED MAIL.JS LOADED MAIL.JS LOADED MAIL.JS LOADEDMAIL.JS LOADEDMAIL.JS LOADEDMAIL.JS LOADEDMAIL.JS LOADEDMAIL.JS LOADED ");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;