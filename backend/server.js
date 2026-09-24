// ============================================================
// TECHNOVA SENTINEL AI
// Backend Server
// ============================================================

console.log("🔥 SERVER.JS STARTED");

const express = require("express");
const cors = require("cors");
const path = require("path");

// ============================================================
// ENVIRONMENT
// ============================================================

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// ============================================================
// DATABASE
// ============================================================

const connectDB = require("./config/db");

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// DATABASE CONNECTION
// ============================================================

connectDB();

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TECHNOVA Sentinel AI Backend Running",
    service: "Node / Express API",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is healthy",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API ROUTES
// ============================================================

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");

const diseaseRoutes = require("./routes/diseaseRoutes");
const diseaseMasterRoutes = require("./routes/diseaseMasterRoutes");
const diseaseCaseRoutes = require("./routes/diseaseCaseRoutes");

const districtRoutes = require("./routes/districtRoutes");
const districtsRoutes = require("./routes/districts");

const predictionRoutes = require("./routes/predictionRoutes");
const predictionsRoutes = require("./routes/predictions");

const dashboardRoutes = require("./routes/dashboardRoutes");

const alertRoutes = require("./routes/alertRoutes");

const explanationRoutes = require("./routes/explanationRoutes");
const shapRoutes = require("./routes/shapRoutes");

const validationRoutes = require("./routes/validationRoutes");

const mapRoutes = require("./routes/mapRoutes");

const dataSourceRoutes = require("./routes/dataSourceRoutes");

// ============================================================
// ROUTE REGISTRATION
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/disease", diseaseRoutes);
app.use("/api/disease-master", diseaseMasterRoutes);
app.use("/api/disease-cases", diseaseCaseRoutes);

app.use("/api/district", districtRoutes);
app.use("/api/districts", districtsRoutes);

app.use("/api/predictions", predictionRoutes);
app.use("/api/prediction-data", predictionsRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/explanations", explanationRoutes);
app.use("/api/shap", shapRoutes);

app.use("/api/validation", validationRoutes);

app.use("/api/map", mapRoutes);

app.use("/api/data-sources", dataSourceRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("❌ Express Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT =
  Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    `🌐 API: http://localhost:${PORT}`
  );

  console.log(
    `❤️ Health: http://localhost:${PORT}/api/health`
  );
});