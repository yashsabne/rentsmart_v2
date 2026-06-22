import sendEmail from "../services/sendEmail.js";

const logEmail = (event, data = {}) => {
  console.log(
    `[EMAIL] ${event}`,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        ...data,
      },
      null,
      2
    )
  );
};

export const paymentSuccess = async (req, res) => {
  const requestId = Date.now();

  try {
    const {
      email,
      ownerName,
      propertyTitle,
      tenantName = "",
    } = req.body;

    logEmail("PAYMENT_SUCCESS_STARTED", {
      requestId,
      email,
      propertyTitle,
      ownerName,
    });

    const response = await sendEmail({
      to: email,
      name: tenantName,
      subject: "Payment Successful • RentSmart",
      html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:30px;">
        
        <h1 style="color:#2563eb;margin-bottom:10px;">
          Payment Successful 🎉
        </h1>

        <p>Hello ${tenantName || "User"},</p>

        <p>
          Your payment has been successfully processed and the property owner's
          contact information has been unlocked.
        </p>

        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <p><strong>Property:</strong> ${propertyTitle}</p>
          <p><strong>Owner:</strong> ${ownerName}</p>
        </div>

        <p>
          Thank you for choosing RentSmart.
        </p>

        <hr style="margin:25px 0;" />

        <p style="font-size:12px;color:#6b7280;">
          This is an automated email from RentSmart.
        </p>
      </div>
      `,
    });

    logEmail("PAYMENT_SUCCESS_SENT", {
      requestId,
      email,
      brevoResponse: response,
    });

    return res.status(200).json({
      success: true,
      message: "Payment email sent",
    });
  } catch (error) {
    console.error("[PAYMENT_SUCCESS_ERROR]", {
      requestId,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send payment email",
    });
  }
};

export const contactRevealed = async (req, res) => {
  const requestId = Date.now();

  try {
    const {
      email,
      ownerName,
      ownerPhone,
      tenantName = "",
    } = req.body;

    logEmail("CONTACT_UNLOCK_STARTED", {
      requestId,
      email,
      ownerName,
      ownerPhone,
    });

    const response = await sendEmail({
      to: email,
      name: tenantName,
      subject: "Owner Contact Unlocked • RentSmart",
      html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:30px;">

        <h1 style="color:#16a34a;">
          Contact Details Unlocked 🔓
        </h1>

        <p>Hello ${tenantName || "User"},</p>

        <p>
          You can now contact the property owner directly.
        </p>

        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <p><strong>Owner Name:</strong> ${ownerName}</p>
          <p><strong>Phone Number:</strong> ${ownerPhone}</p>
        </div>

        <p>
          Please communicate respectfully and verify all property details
          before making any financial commitments.
        </p>

        <p>
          Regards,<br/>
          RentSmart Team
        </p>
      </div>
      `,
    });

    logEmail("CONTACT_UNLOCK_SENT", {
      requestId,
      email,
      brevoResponse: response,
    });

    return res.status(200).json({
      success: true,
      message: "Contact details sent",
    });
  } catch (error) {
    console.error("[CONTACT_UNLOCK_ERROR]", {
      requestId,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send contact details",
    });
  }
};

export const ownerContactRevealed = async (req, res) => {
  const requestId = Date.now();

  try {
    const {
      email,
      ownerName = "",
      buyerName,
      buyerEmail,
      buyerPhone,
      propertyTitle,
    } = req.body;

    logEmail("OWNER_NOTIFICATION_STARTED", {
      requestId,
      email,
      buyerName,
      propertyTitle,
    });

    const response = await sendEmail({
      to: email,
      name: ownerName,
      subject: "A User Viewed Your Contact Details • RentSmart",
      html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:30px;">

        <h1 style="color:#2563eb;">
          New Interested User 👀
        </h1>

        <p>
          Someone has unlocked your contact details for one of your listings.
        </p>

        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <p><strong>Property:</strong> ${propertyTitle}</p>
        </div>

        <h3>Interested User Details</h3>

        <p><strong>Name:</strong> ${buyerName}</p>
        <p><strong>Email:</strong> ${buyerEmail}</p>
        <p><strong>Phone:</strong> ${buyerPhone}</p>

        <p style="margin-top:20px;">
          You may contact this user directly if you'd like to continue the conversation.
        </p>

        <p>
          Regards,<br/>
          RentSmart Team
        </p>
      </div>
      `,
    });

    logEmail("OWNER_NOTIFICATION_SENT", {
      requestId,
      email,
      brevoResponse: response,
    });

    return res.status(200).json({
      success: true,
      message: "Owner notification sent",
    });
  } catch (error) {
    console.error("[OWNER_NOTIFICATION_ERROR]", {
      requestId,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to notify owner",
    });
  }
};