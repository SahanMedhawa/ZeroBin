// Packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import session from "express-session";

// Utils
import connectDB from "./config/db.js";
import configurePassport from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";

import collectorRoutes from "./routes/collectorRoutes.js"
import wmaRoutes from "./routes/wmaRoutes.js";
import garbageRoutes from "./routes/garbageRoutes.js"; // fixed typo in garbageRoutes
import scheduleRoutes from "./routes/scheduleRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import areaRoutes from "./routes/areaRoutes.js"; // Import areaRoutes
import grievanceRoutes from "./routes/grievanceRoutes.js"; // Import grievanceRoutes
// Removed: Smart Device routes - replaced by Smart Bin system (one bin per user)
// import smartDeviceRoutes from "./routes/smartDeviceRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"; // Import contactRoutes

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

// Enable CORS

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true, // Allow credentials (cookies) to be included
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Conn Testing
app.get("/api", (req, res) => {
  res.send("Connected to ZeroBin API");
});

// Users Route
app.use("/api/users", userRoutes);

// WMA Route
app.use("/api/wmas", wmaRoutes);

// Garbage Route
app.use("/api/garbage", garbageRoutes);

// Collector Route
app.use("/api/collector", collectorRoutes);

// Schedule Route
app.use("/api/schedule", scheduleRoutes);

// Transaction Route
app.use("/api/transactions", transactionRoutes);

// Area Route
app.use("/api/areas", areaRoutes);

// Grievance Route
app.use("/api/grievances", grievanceRoutes);

// Removed: Smart Device routes - replaced by Smart Bin system (one bin per user)
// app.use("/api/smartDevices", smartDeviceRoutes);

// Contact Route
app.use("/api/contacts", contactRoutes);

app.listen(port, () => console.log(`Server running on port: ${port}`));

export default app;
