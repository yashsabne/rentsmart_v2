const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendBrevoEmail = async ({ to, name = "", subject, html }) => {
  try {
    console.log("========== BREVO EMAIL START ==========");
    console.log("To:", to);
    console.log("Name:", name);
    console.log("Subject:", subject);
    console.log("Sender:", process.env.OWNER_EMAIL);
    console.log(
      "API Key Exists:",
      !!process.env.BREVO_API_KEY
    );

    const payload = {
      sender: {
        name: "RentSmart",
        email: process.env.OWNER_EMAIL,
      },
      to: [name ? { email: to, name } : { email: to }],
      subject,
      htmlContent: html,
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    console.log("Brevo Status:", response.status);

    const data = await response.json();

    console.log(
      "Brevo Response:",
      JSON.stringify(data, null, 2)
    );

    

    if (!response.ok) {
      throw new Error(
        `Brevo API error: ${JSON.stringify(data)}`
      );
    }

    console.log("========== BREVO EMAIL SENT ==========");

    return data;
  } catch (error) {
    console.error("BREVO EMAIL ERROR:", error);
    throw error;
  }
};