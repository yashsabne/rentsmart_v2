
import {
  emailLayout,
  emailButton,
  escapeHtml,
} from "../../utils/emailLayout.js";

export const verificationTemplate = ({
  firstName,
  verificationLink,
}) => {
  if (!firstName || !verificationLink) {
    throw new Error("Missing verification email fields");
  }

  const safeName = escapeHtml(firstName);

  const content = `
    <h2 style="
      margin:0 0 18px;
      color:#1e293b;
      font-size:24px;
    ">
      Welcome to RentSmart!
    </h2>

    <p>Hello ${safeName},</p>

    <p>
      Thank you for creating your RentSmart account.
      We're excited to have you with us.
    </p>

    <p>
      Please verify your email address to activate
      your account.
    </p>

    ${emailButton(verificationLink, "Verify Email")}

    <p style="
      margin-top:20px;
      color:#64748b;
      font-size:14px;
    ">
      This verification link expires in 24 hours.
    </p>

    <p style="
      color:#64748b;
      font-size:13px;
    ">
      If you didn't create a RentSmart account,
      you can safely ignore this email.
    </p>
  `;

  return {
    subject: "Verify your RentSmart account",
    html: emailLayout({
      title: "Verify your RentSmart account",
      preheader: "Verify your email address to activate your RentSmart account.",
      content,
    }),
  };
};
    