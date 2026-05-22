import dotenv from "dotenv";

dotenv.config();


const requireVerifiedEmail = async (req, res, next) => {
  try {
    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/api/auth/check-verification/${req.user.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: data.message || "Verification check failed",
      });
    }

    if (!data.verified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message:
          "Payment failed. Please verify your email address before making a payment.",
      });
    }

    next();
  } catch (err) {
    console.error("Verification Error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to verify email status",
    });
  }
};
 

export default requireVerifiedEmail;