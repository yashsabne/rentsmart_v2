
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendBrevoEmail = async ({
  to,
  name = "",
  subject,
  html,
}) => {
  if (!process.env.BREVO_API_KEY || !process.env.OWNER_EMAIL) {
    throw new Error("Brevo configuration is missing");
  }

  if (!to || !subject || !html) {
    throw new Error("Invalid email payload");
  }

  const payload = {
    sender: {
      name: "RentSmart",
      email: process.env.OWNER_EMAIL,
    },
    to: [
      name
        ? { email: to, name }
        : { email: to },
    ],
    subject,
    htmlContent: html,
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

 if (!response.ok) {
  const error = new Error(
    `Brevo API error (${response.status}): ${
      data.message || "Email delivery failed"
    }`
  );

  error.statusCode = response.status;

  throw error;
}

  return data;
};
