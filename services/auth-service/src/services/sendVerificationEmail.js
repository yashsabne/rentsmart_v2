 
import transporter from "../config/mail.js";

export const sendVerificationEmail = async (
  email,
  firstName,
  verificationLink
) => {
  try {
    console.log("=================================");
    console.log("Starting Verification Email Flow");
    console.log("Recipient:", email);

    console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("HAS_PASS:", !!process.env.SMTP_PASS);
 
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");

    const info = await transporter.sendMail({
      from: `"RentSmart" <${process.env.OWNER_EMAIL}>`,
      to: email,
      subject: "Verify Your RentSmart Account",

      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Verify Your Account</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f5f7fb;
          font-family:Arial, Helvetica, sans-serif;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding:40px 20px;"
        >
          <tr>
            <td align="center">

              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#ffffff;
                  border-radius:16px;
                  overflow:hidden;
                  box-shadow:0 4px 18px rgba(0,0,0,0.08);
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    style="
                      background:#2563eb;
                      padding:30px;
                      text-align:center;
                    "
                  >
                    <h1
                      style="
                        margin:0;
                        color:white;
                        font-size:30px;
                      "
                    >
                      RentSmart
                    </h1>

                    <p
                      style="
                        color:#dbeafe;
                        margin-top:8px;
                        font-size:14px;
                      "
                    >
                      Smart Property Renting & Selling Platform
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">

                    <h2
                      style="
                        margin-top:0;
                        color:#111827;
                      "
                    >
                      Hello ${firstName},
                    </h2>

                    <p
                      style="
                        color:#4b5563;
                        line-height:1.7;
                        font-size:15px;
                      "
                    >
                      Welcome to RentSmart. Thank you for creating an account.
                    </p>

                    <p
                      style="
                        color:#4b5563;
                        line-height:1.7;
                        font-size:15px;
                      "
                    >
                      Please verify your email address to unlock all platform features:
                    </p>

                    <ul
                      style="
                        color:#4b5563;
                        line-height:2;
                        padding-left:20px;
                      "
                    >
                      <li>Create Property Listings</li>
                      <li>Reveal Owner Contact Information</li>
                      <li>Send Property Inquiries</li>
                      <li>Manage Saved Properties</li>
                      <li>Access Personalized Dashboard</li>
                    </ul>

                    <div
                      style="
                        text-align:center;
                        margin:35px 0;
                      "
                    >
                      <a
                        href="${verificationLink}"
                        style="
                          background:#2563eb;
                          color:white;
                          text-decoration:none;
                          padding:14px 28px;
                          border-radius:10px;
                          display:inline-block;
                          font-weight:bold;
                          font-size:15px;
                        "
                      >
                        Verify My Email
                      </a>
                    </div>

                    <p
                      style="
                        color:#6b7280;
                        font-size:14px;
                        line-height:1.7;
                      "
                    >
                      This verification link will expire in
                      <strong>24 hours</strong>.
                    </p>

                    <p
                      style="
                        color:#6b7280;
                        font-size:14px;
                        line-height:1.7;
                      "
                    >
                      If you did not create this account, you can safely ignore this email.
                    </p>

                  </td>
                </tr>
 
                <tr>
                  <td
                    style="
                      background:#f9fafb;
                      padding:25px;
                      text-align:center;
                      border-top:1px solid #e5e7eb;
                    "
                  >
                    <p
                      style="
                        margin:0;
                        color:#6b7280;
                        font-size:13px;
                      "
                    >
                      © ${new Date().getFullYear()} RentSmart. All rights reserved.
                    </p>

                    <p
                      style="
                        margin-top:8px;
                        color:#9ca3af;
                        font-size:12px;
                      "
                    >
                      This is an automated message. Please do not reply.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    console.log("✅ Verification Email Sent Successfully");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("=================================");

    return true;
  } catch (error) {
    console.error("=================================");
    console.error("❌ EMAIL SERVICE ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Full Error:", error);
    console.error("=================================");

    throw error;
  }
};
 