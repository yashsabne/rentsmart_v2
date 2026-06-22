import sendEmail from "../services/sendEmail.js";

 
export const paymentSuccess = async (req, res) => {
  const requestId = Date.now();
  try {
    const { email, ownerName, propertyTitle, tenantName = "" } = req.body;

    logEmail("PAYMENT_SUCCESS_STARTED", { requestId, email, propertyTitle, ownerName });

    const response = await sendEmail({
      to: email,
      name: tenantName,
      subject: "Payment Successful • RentSmart",
      html: `
        <div style="max-width:640px;margin:auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color:#2563eb;font-size:28px;margin:0 0 18px;font-weight:700;">Payment Successful 🎉</h1>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">Hello ${tenantName || "User"},</p>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            We're pleased to confirm that your payment has been processed successfully. As a result, the property owner's
            contact information has now been unlocked and is available for you to use.
          </p>

          <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px 24px;border-radius:10px;margin:22px 0;font-size:16px;line-height:1.9;color:#1e293b;">
            <p><strong>Property:</strong> ${propertyTitle}</p>
            <p><strong>Owner:</strong> ${ownerName}</p>
          </div>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            Thank you for choosing RentSmart for your rental journey. We wish you a smooth and successful experience ahead.
          </p>

          <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />

          <p style="font-size:14px;color:#64748b;line-height:1.6;">
            This is an automated email from RentSmart. Please do not reply directly to this message.
          </p>
        </div>
      `,
    });

    logEmail("PAYMENT_SUCCESS_SENT", { requestId, email, brevoResponse: response });

    return res.status(200).json({ success: true, message: "Payment email sent" });
  } catch (error) {
    console.error("[PAYMENT_SUCCESS_ERROR]", { requestId, message: error.message, stack: error.stack });

    return res.status(500).json({ success: false, message: "Failed to send payment email" });
  }
};

export const contactRevealed = async (req, res) => {
  const requestId = Date.now();
  try {
    const { email, ownerName, ownerPhone, tenantName = "" } = req.body;

    logEmail("CONTACT_UNLOCK_STARTED", { requestId, email, ownerName, ownerPhone });

    const response = await sendEmail({
      to: email,
      name: tenantName,
      subject: "Owner Contact Unlocked • RentSmart",
      html: `
        <div style="max-width:640px;margin:auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color:#16a34a;font-size:28px;margin:0 0 18px;font-weight:700;">Contact Details Unlocked 🔓</h1>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">Hello ${tenantName || "User"},</p>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            Good news — you now have full access to the property owner's contact details and can reach out to them directly.
          </p>

          <div style="background:#f8fafc;border-left:4px solid #16a34a;padding:20px 24px;border-radius:10px;margin:22px 0;font-size:16px;line-height:1.9;color:#1e293b;">
            <p><strong>Owner Name:</strong> ${ownerName}</p>
            <p><strong>Phone Number:</strong> ${ownerPhone}</p>
          </div>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            Please communicate respectfully and take the time to verify all property details before making any
            financial commitments.
          </p>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0;">
            Regards,<br/>
            RentSmart Team
          </p>
        </div>
      `,
    });

    logEmail("CONTACT_UNLOCK_SENT", { requestId, email, brevoResponse: response });

    return res.status(200).json({ success: true, message: "Contact details sent" });
  } catch (error) {
    console.error("[CONTACT_UNLOCK_ERROR]", { requestId, message: error.message, stack: error.stack });

    return res.status(500).json({ success: false, message: "Failed to send contact details" });
  }
};

export const ownerContactRevealed = async (req, res) => {
  const requestId = Date.now();
  try {
    const { email, ownerName = "", buyerName, buyerEmail, buyerPhone, propertyTitle } = req.body;

    logEmail("OWNER_NOTIFICATION_STARTED", { requestId, email, buyerName, propertyTitle });

    const response = await sendEmail({
      to: email,
      name: ownerName,
      subject: "A User Viewed Your Contact Details • RentSmart",
      html: `
        <div style="max-width:640px;margin:auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color:#2563eb;font-size:28px;margin:0 0 18px;font-weight:700;">New Interested User 👀</h1>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            Someone has just unlocked your contact details for one of your active listings, and may reach out to you soon.
          </p>

          <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px 24px;border-radius:10px;margin:22px 0;font-size:16px;line-height:1.9;color:#1e293b;">
            <p><strong>Property:</strong> ${propertyTitle}</p>
          </div>

          <h3 style="font-size:18px;color:#1e293b;margin:22px 0 10px;">Interested User Details</h3>

          <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px 24px;border-radius:10px;margin:0 0 22px;font-size:16px;line-height:1.9;color:#1e293b;">
            <p><strong>Name:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Phone:</strong> ${buyerPhone}</p>
          </div>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            You may contact this user directly if you'd like to continue the conversation.
          </p>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0;">
            Regards,<br/>
            RentSmart Team
          </p>
        </div>
      `,
    });

    logEmail("OWNER_NOTIFICATION_SENT", { requestId, email, brevoResponse: response });

    return res.status(200).json({ success: true, message: "Owner notification sent" });
  } catch (error) {
    console.error("[OWNER_NOTIFICATION_ERROR]", { requestId, message: error.message, stack: error.stack });

    return res.status(500).json({ success: false, message: "Failed to notify owner" });
  }
};

export const promoteSuccess = async (req, res) => {
  try {
    const { email, name = "", propertyTitle } = req.body;

    await sendEmail({
      to: email,
      name,
      subject: "Listing Promotion Activated • RentSmart",
      html: `
        <div style="max-width:640px;margin:auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color:#2563eb;font-size:28px;margin:0 0 18px;font-weight:700;">Promotion Activated 🚀</h1>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">Hello ${name || "User"},</p>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0 0 14px;">
            Congratulations! Your property listing has been successfully promoted and will now receive increased
            visibility across RentSmart for the next 30 days.
          </p>

          <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px 24px;border-radius:10px;margin:22px 0;font-size:16px;line-height:1.9;color:#1e293b;">
            <p><strong>Property:</strong> ${propertyTitle}</p>
          </div>

          <p style="font-size:17px;line-height:1.7;color:#1e293b;margin:0;">
            Thank you for choosing RentSmart to help you reach more prospective tenants and buyers.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Promotion email sent" });
  } catch (error) {
    console.error("[PROMOTE_SUCCESS_ERROR]", error);

    return res.status(500).json({ success: false, message: "Failed to send promotion email" });
  }
};