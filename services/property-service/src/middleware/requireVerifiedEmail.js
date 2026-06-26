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
        message: data.message || "Verification check failed"
      });
    }

    if (!data.verified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email first, we will redirect you..."
      });
    }

    if (!data.phone) {
      return res.status(403).json({
        success: false,
        code: "PHONE_MISSING",
        message: "Please add a phone number first..."
      });
    }

    next();

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to verify email status"
    });
  }
};

export default requireVerifiedEmail;