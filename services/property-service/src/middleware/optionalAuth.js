import jwt from "jsonwebtoken";
 

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch { 
  }
  next();
};