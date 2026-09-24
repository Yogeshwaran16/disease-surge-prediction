const express = require("express");

const router = express.Router();

const {
  getPredictions,
  getPredictionById,
  createPrediction,
  getPredictionStats,
  deletePrediction,
} = require("../controllers/predictionController");

// =====================================================
// Prediction Statistics
// GET /api/prediction-data/stats
// =====================================================

router.get(
  "/stats",
  getPredictionStats
);

// =====================================================
// Get All Predictions
// GET /api/prediction-data
// =====================================================

router.get(
  "/",
  getPredictions
);

// =====================================================
// Get Prediction By ID
// IMPORTANT:
// Keep this AFTER custom routes
// =====================================================

router.get(
  "/:id",
  getPredictionById
);

// =====================================================
// Create Prediction
// POST /api/prediction-data
// =====================================================

router.post(
  "/",
  createPrediction
);

// =====================================================
// Delete Prediction
// DELETE /api/prediction-data/:id
// =====================================================

router.delete(
  "/:id",
  deletePrediction
);

module.exports = router;