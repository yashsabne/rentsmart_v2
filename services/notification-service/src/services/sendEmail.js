 
import { sendBrevoEmail } from "../config/brevo.js";

/**
 * Unified email sender used by all controllers.
 * @param {{ to: string, name?: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, name = "", subject, html }) => {
  return await sendBrevoEmail({ to, name, subject, html });
};

export default sendEmail;
