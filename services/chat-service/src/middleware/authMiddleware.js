const jwt = require("jsonwebtoken");

 
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

 
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: No token."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;  
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token."));
  }
};

module.exports = { protect, socketAuth };