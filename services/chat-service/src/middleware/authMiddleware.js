const jwt = require("jsonwebtoken");

/**
 * Verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 * Matches the same JWT_SECRET used in auth-service.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full decoded user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Socket.IO auth middleware — verifies token from handshake auth.
 * Usage: io.use(socketAuth)
 */
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: No token."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach to socket object
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token."));
  }
};

module.exports = { protect, socketAuth };