import sendEmail from "../services/sendEmail.js";
 
export const paymentSuccess = async (req, res) => {
  try {
    const { email, ownerName, propertyTitle, tenantName = "" } = req.body;

    await sendEmail({
      to: email,
      name: tenantName,
      subject: "Payment Successful - RentSmart",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Payment Successful 🎉</h2>
          <p>You successfully unlocked contact details for:</p>
          <h3>${propertyTitle}</h3>
          <p>Owner: ${ownerName}</p>
          <br/>
          <p>Thank you for using RentSmart.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Payment email sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};
 
export const contactRevealed = async (req, res) => {
  try {
    const { email, ownerName, ownerPhone, tenantName = "" } = req.body;

    await sendEmail({
      to: email,
      name: tenantName,
      subject: "Owner Contact Unlocked - RentSmart",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Contact Unlocked 🔓</h2>
          <p>Owner Name: ${ownerName}</p>
          <p>Phone: ${ownerPhone}</p>
          <br/>
          <p>Use responsibly and stay safe.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

 
export const ownerContactRevealed = async (req, res) => {
  try {
    const {
      email,
      ownerName = "",
      buyerName,
      buyerEmail,
      buyerPhone,
      propertyTitle,
    } = req.body;
    

 
    await sendEmail({
      to: email,
      name: ownerName,
      subject: "Someone Unlocked Your Contact Details - RentSmart",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Contact Details Viewed 👀</h2>

          <p>Someone unlocked your contact details for:</p>

          <h3>${propertyTitle}</h3>

          <hr/>

          <p><strong>Buyer Name:</strong> ${buyerName}</p>
          <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
          <p><strong>Buyer Phone:</strong> ${buyerPhone}</p>

          <br/>

          <p>You may contact the interested tenant if needed.</p>

          <p>Thank you,<br/>RentSmart Team</p>
        </div>
      `,
    });

 
    return res.status(200).json({
      success: true,
      message: "Owner notification sent",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to notify owner",
    });
  }
};