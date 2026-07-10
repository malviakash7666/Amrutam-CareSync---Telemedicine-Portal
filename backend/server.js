import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import db, { sequelize } from "./src/database/models/index.js";
import userRoute from "./src/modules/user/user.route.js";
import doctorRoute from "./src/modules/doctor/doctor.route.js";
import consultationRoute from "./src/modules/consultation/consultation.route.js";
import prescriptionRoute from "./src/modules/prescription/prescription.route.js";
import paymentRoute from "./src/modules/payment/payment.route.js";
import adminRoute from "./src/modules/admin/admin.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// Middlewares
// --------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------
// API Routes
// --------------------

app.use("/api/users", userRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/consultations", consultationRoute);
app.use("/api/prescriptions", prescriptionRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/admin", adminRoute);

// --------------------
// Default Route
// --------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Server is running 🚀",
  });
});

// --------------------
// 404 Route
// --------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// --------------------
// Global Error Handler
// --------------------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------
// Database + Server Start
// --------------------

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.log("Database connection failed ❌");
    console.error(error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
