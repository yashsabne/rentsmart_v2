import jwt from "jsonwebtoken";
import { redisGet } from "../utils/redisClient.js";
 
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const blacklistResult = await redisGet(`/token/blacklist/${token}`);
    if (blacklistResult?.blacklisted) {
      return res.status(401).json({ message: "Token revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("error", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware; 