 
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendBrevoEmail = async ({ to, name = "", subject, html }) => {
  const response = await fetch(BREVO_API_URL, {
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
      to: [name ? { email: to, name } : { email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Brevo API error: ${JSON.stringify(data)}`);
  }

  return data;
};