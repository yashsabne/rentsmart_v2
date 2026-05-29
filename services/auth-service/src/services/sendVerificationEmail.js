import transporter from "../config/mail.js";

export const sendVerificationEmail = async (
  email,
  firstName,
  verificationLink
) => {


  console.log("email verifation sent successsfulyy")

  await transporter.sendMail({
    from: `"RentSmart" <${process.env.OWNER_EMAIL}>`,
    to: email,
    subject: "Verify your RentSmart account",

    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>Hello ${firstName}</h2>

        <p>
          Welcome to RentSmart.
        </p>

        <p>
          Please verify your email address to unlock:
        </p>

        <ul>
          <li>Create Property Listings</li>
          <li>Reveal Owner Contact Details</li>
          <li>Send Property Inquiries</li>
        </ul>

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

        <p>
          Link expires in 24 hours.
        </p>
      </div>
    `,
  });

};