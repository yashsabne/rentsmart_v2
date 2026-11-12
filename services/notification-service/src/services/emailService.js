
import { sendBrevoEmail } from "../config/brevo.js";

export const sendEmail = async ({
  to,
  name = "",
  subject,
  html,
}) => {
  return sendBrevoEmail({
    to,
    name,
    subject,
    html,
  });
};
