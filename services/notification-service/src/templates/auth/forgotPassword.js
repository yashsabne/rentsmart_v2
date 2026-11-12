
import {
  emailLayout,
  emailButton,
  escapeHtml,
} from "../../utils/emailLayout.js";

export const forgotPasswordTemplate = ({
  firstName,
  resetLink,
}) => {
  if (!firstName || !resetLink) {
    throw new Error("Missing password reset email fields");
  }

  const safeName = escapeHtml(firstName);

  const content = `
    <h2 style="
      margin:0 0 18px;
      color:#1e293b;
      font-size:24px;
    ">
      Reset Your Password
    </h2>

    <p>Hello ${safeName},</p>

    <p>
      We received a request to reset your RentSmart password.
    </p>

    <p>
      Click the button below to create a new password.
    </p>

    ${emailButton(resetLink, "Reset Password")}

    <p style="
      margin-top:20px;
      color:#64748b;
      font-size:14px;
    ">
      This password reset link expires in 1 hour.
    </p>

    <p style="
      color:#64748b;
      font-size:13px;
    ">
      If you didn't request a password reset,
      you can safely ignore this email.
      Your password will remain unchanged.
    </p>

    <p style="
      color:#64748b;
      font-size:13px;
    ">
      For security reasons, never share your reset link with anyone.
    </p>
  `;

  return {
    subject: "Reset your RentSmart password",
    html: emailLayout({
      title: "Reset your RentSmart password",
      preheader: "You requested a password reset for your RentSmart account.",
      content,
    }),
  };
};
