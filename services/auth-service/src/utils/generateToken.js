// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => jwt.sign(
  {
    id: user._id,
    city: user.city || null,
    preferences: user.preferences || [], 
  },
  process.env.JWT_SECRET,
  { expiresIn: "5d" }
);