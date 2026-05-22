import sendEmail from "../services/sendEmail.js";

 
export const paymentSuccess = async (req, res) => {

  try {

    const {
      email,
      ownerName,
      propertyTitle,
    } = req.body;

    await sendEmail({
      to: email,

      subject: "Payment Successful - RentSmart",

      html: `
        <h2>Payment Successful </h2>

        <p>You successfully unlocked contact details for:</p>

        <h3>${propertyTitle}</h3>

        <p>Owner: ${ownerName}</p>

        <br/>

        <p>Thank you for using RentSmart.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Payment email sent",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};



// CONTACT REVEALED EMAIL
export const contactRevealed = async (req, res) => {

  try {

    const {
      email,
      ownerName,
      ownerPhone,
    } = req.body;

    await sendEmail({
      to: email,

      subject: "Owner Contact Unlocked",

      html: `
        <h2>Contact Unlocked </h2>

        <p>Owner Name: ${ownerName}</p>

        <p>Phone: ${ownerPhone}</p>

        <br/>

        <p>Use responsibly and stay safe.</p>
      `,
    });

    res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
    });
  }
};