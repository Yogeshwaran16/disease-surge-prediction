const express = require("express");

const router = express.Router();

const diseaseController =
  require("../controllers/diseaseController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// ============================================
// SEARCH DISEASES
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/search",
  authMiddleware,
  diseaseController.searchDiseases
);


// ============================================
// GET ALL DISEASES
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/",
  authMiddleware,
  diseaseController.getAllDiseases
);


// ============================================
// GET DISEASE BY ID
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/:id",
  authMiddleware,
  diseaseController.getDiseaseById
);


// ============================================
// CREATE DISEASE
// ADMIN ONLY
// ============================================

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseController.createDisease
);


// ============================================
// UPDATE DISEASE
// ADMIN ONLY
// ============================================

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseController.updateDisease
);


// ============================================
// DELETE DISEASE
// ADMIN ONLY
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseController.deleteDisease
);


module.exports = router;