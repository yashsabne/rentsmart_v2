import transporter from "../config/mail.js";

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `RentSmart <${process.env.OWNER_EMAIL}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;