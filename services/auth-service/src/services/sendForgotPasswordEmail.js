export const sendForgotPasswordEmail = async (email, firstName, resetLink) => {
  const html = `
    <div style="font-family:Arial;padding:20px;max-width:600px">
      <h2>Hello ${firstName},</h2>
      <p>We received a request to reset your RentSmart password.</p>
      <p>Click the button below to reset it. This link expires in <strong>1 hour</strong>.</p>

      
      <a
        href="${resetLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:8px;
          margin:16px 0; 
        "
      >
        Reset Password
      </a>
      <p style="color:#666;font-size:13px" > If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p style="color:#666;font-size:13px" >Or copy this link: ${resetLink}</p>
    </div>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "RentSmart", email: process.env.OWNER_EMAIL },
      to: [{ email, name: firstName }],
      subject: "Reset your RentSmart password",
      htmlContent: html,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};