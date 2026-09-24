const express = require("express");

const router = express.Router();

const districtController =
  require("../controllers/districtController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// ============================================
// SEARCH DISTRICTS
// GET /api/districts/search?name=Chennai
// ============================================

router.get(
  "/search",
  authMiddleware,
  districtController.searchDistricts
);


// ============================================
// GET DISTRICTS BY RISK LEVEL
// GET /api/districts/risk/HIGH
// ============================================

router.get(
  "/risk/:risk_level",
  authMiddleware,
  districtController.getDistrictsByRisk
);


// ============================================
// DISTRICT STATISTICS
// GET /api/districts/stats
// IMPORTANT: Must be before /:id
// ============================================

router.get(
  "/stats",
  authMiddleware,
  districtController.getDistrictStats
);


// ============================================
// GET ALL DISTRICTS
// GET /api/districts
// ============================================

router.get(
  "/",
  authMiddleware,
  districtController.getAllDistricts
);


// ============================================
// GET DISTRICT BY ID
// GET /api/districts/:id
// ============================================

router.get(
  "/:id",
  authMiddleware,
  districtController.getDistrictById
);


// ============================================
// CREATE DISTRICT
// POST /api/districts
// ADMIN ONLY
// ============================================

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  districtController.createDistrict
);


// ============================================
// UPDATE DISTRICT
// PUT /api/districts/:id
// ADMIN ONLY
// ============================================

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  districtController.updateDistrict
);


// ============================================
// DELETE DISTRICT
// DELETE /api/districts/:id
// ADMIN ONLY
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  districtController.deleteDistrict
);


module.exports = router;