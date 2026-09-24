const express =
  require("express");

const router =
  express.Router();

const predictionController =
  require(
    "../controllers/predictionController"
  );

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const writeAccessMiddleware =
  require(
    "../middleware/writeAccessMiddleware"
  );


// ============================================
// GET PREDICTION STATISTICS
// MUST BE BEFORE /:id
// ============================================

router.get(
  "/stats",
  authMiddleware,
  predictionController.getPredictionStats
);


// ============================================
// GET ALL PREDICTIONS
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/",
  authMiddleware,
  predictionController.getPredictions
);


// ============================================
// CREATE PREDICTION
// ADMIN + HEALTH OFFICER
// VIEWER BLOCKED
// ============================================

router.post(
  "/",
  authMiddleware,
  writeAccessMiddleware,
  predictionController.createPrediction
);


// ============================================
// GET SINGLE PREDICTION
// ============================================

router.get(
  "/:id",
  authMiddleware,
  predictionController.getPredictionById
);


// ============================================
// DELETE PREDICTION
// VIEWER BLOCKED
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  writeAccessMiddleware,
  predictionController.deletePrediction
);


module.exports =
  router;