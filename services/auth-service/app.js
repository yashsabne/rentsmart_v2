import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import session from "express-session";
import initPassport from "./src/config/passport.js";
import socialAuthRoutes from "./src/routes/socialAuthRoutes.js";
import passport from "passport";
 

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// test route
app.get("/test", (req, res) => {
  res.send("Auth Service Running 🚀");
});

// routes
app.use("/api/auth", authRoutes);


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
}));
 
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());
  
app.use("/auth/social", socialAuthRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
