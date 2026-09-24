const express = require("express");

const router = express.Router();

const dashboardController =
  require("../controllers/dashboardController");

const authMiddleware =
  require("../middleware/authMiddleware");


// ============================================
// DASHBOARD SUMMARY
// ============================================

router.get(
  "/summary",
  authMiddleware,
  dashboardController.getDashboardSummary
);


// ============================================
// RECENT ALERTS
// ============================================

router.get(
  "/alerts",
  authMiddleware,
  dashboardController.getRecentAlerts
);


module.exports = router;