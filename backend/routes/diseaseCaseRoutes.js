const express = require("express");

const router = express.Router();

const diseaseCaseController =
  require("../controllers/diseaseCaseController");

const authMiddleware =
  require("../middleware/authMiddleware");

const writeAccessMiddleware =
  require("../middleware/writeAccessMiddleware");


// ============================================
// DASHBOARD STATISTICS
// ============================================

router.get(
  "/dashboard",
  authMiddleware,
  diseaseCaseController.getDashboardStats
);


// ============================================
// SEARCH DISEASE CASES
// ============================================

router.get(
  "/search",
  authMiddleware,
  diseaseCaseController.searchDiseaseCases
);


// ============================================
// GET ALL DISEASE CASES
// ============================================

router.get(
  "/",
  authMiddleware,
  diseaseCaseController.getAllDiseaseCases
);


// ============================================
// GET DISEASE CASE BY ID
// ============================================

router.get(
  "/:id",
  authMiddleware,
  diseaseCaseController.getDiseaseCaseById
);


// ============================================
// CREATE DISEASE CASE
// ============================================

router.post(
  "/",
  authMiddleware,
  writeAccessMiddleware,
  diseaseCaseController.createDiseaseCase
);


// ============================================
// UPDATE DISEASE CASE
// ============================================

router.put(
  "/:id",
  authMiddleware,
  writeAccessMiddleware,
  diseaseCaseController.updateDiseaseCase
);


// ============================================
// DELETE DISEASE CASE
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  writeAccessMiddleware,
  diseaseCaseController.deleteDiseaseCase
);


module.exports = router;