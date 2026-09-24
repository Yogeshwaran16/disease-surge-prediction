console.log("🔥 SERVER.JS STARTED");

require("dotenv").config({ path: require("path").join(__dirname, "backend", ".env") });

const express = require("express");
const cors = require("cors");

const app = express();


// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ============================================
// ROUTES IMPORT
// ============================================

const authRoutes =
  require("./backend/routes/auth");

const userRoutes =
  require("./backend/routes/userRoutes");

const diseaseRoutes =
  require("./backend/routes/diseaseRoutes");

const predictionRoutes =
  require("./backend/routes/predictionRoutes");

const dashboardRoutes =
  require("./backend/routes/dashboardRoutes");

const explanationRoutes =
  require("./backend/routes/explanationRoutes");

const alertRoutes =
  require("./backend/routes/alertRoutes");

const districtRoutes =
  require("./backend/routes/districtRoutes");

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/disease", diseaseRoutes);

app.use("/api/predictions", predictionRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/explanations", explanationRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/districts", districtRoutes);

// ============================================
// TEST ROUTE
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Disease Surge Prediction API Running",
  });
});


// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB =
  require("./backend/config/db");

const PORT =
  process.env.PORT || 5000;


// ============================================
// START SERVER
// ============================================

const startServer = async () => {

  try {

    console.log("🔄 Connecting to MongoDB...");

    await connectDB();

    console.log("✅ Database connection completed");

    app.listen(PORT, () => {

      console.log(
        `🚀 Server running on port ${PORT}`
      );

      console.log(
        `🌐 API: http://localhost:${PORT}`
      );

    });

  } catch (error) {

    console.error(
      "❌ Failed to start server:",
      error.message
    );

    process.exit(1);

  }

};


startServer();



