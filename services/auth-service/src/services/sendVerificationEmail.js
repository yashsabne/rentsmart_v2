import transporter from "../config/mail.js";

 
export const sendVerificationEmail = async (
  email,
  firstName,
  verificationLink
) => {

 
  const html = `
    <div style="font-family:Arial;padding:20px">
      <h2>Hello ${firstName}</h2>

      <p>Welcome to RentSmart.</p>

      <p>Please verify your email address.</p>

      <a
        href="${verificationLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Verify Email
      </a>

      <p>Link expires in 24 hours.</p>
    </div>
  `;

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "RentSmart",
          email: process.env.OWNER_EMAIL,
        },
        to: [
          {
            email,
            name: firstName,
          },
        ],
        subject: "Verify your RentSmart account",
        htmlContent: html,
      }),
    }
  );

  const data = await response.json();
 

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};
 