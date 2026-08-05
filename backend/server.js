import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import flightRoutes from "./src/routes/flight.routes.js";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.routes.js";
import session from "express-session";
import passport from "passport";
import "./src/config/passport.js";


connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://7upflight-ticket.com",
  "https://www.7upflight-ticket.com"
];

app.use(cors({
  origin: function(origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true
}));

app.use(
  session({
    secret: "risezonicsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Live par secure cookie true rahegi
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
import jwt from "jsonwebtoken"; // ensure availability if used elsewhere ok

app.use(express.json());
app.use(cookieParser());

// Base Route Test karne ke liye (Aap browser me api.7upflight-ticket.com kholkar check kar sakte hain)
app.get("/", (req, res) => {
  res.send("Risezonic Travel API is Running Successfully Live!");
});

// Routes Configuration
app.use('/api/flights', flightRoutes); // API URL: /api/flights/airports aur /api/flights/search
app.use('/api/auth', userRoutes);

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: "CORS Error: This origin is not allowed." });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});