const express = require("express");

const router = express.Router();

const diseaseMasterController =
  require("../controllers/diseaseMasterController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// ============================================
// GET ALL DISEASES
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/",
  authMiddleware,
  diseaseMasterController.getDiseases
);


// ============================================
// GET SINGLE DISEASE
// ALL AUTHENTICATED USERS
// ============================================

router.get(
  "/:id",
  authMiddleware,
  diseaseMasterController.getDiseaseById
);


// ============================================
// CREATE DISEASE
// ADMIN ONLY
// ============================================

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseMasterController.createDisease
);


// ============================================
// UPDATE DISEASE
// ADMIN ONLY
// ============================================

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseMasterController.updateDisease
);


// ============================================
// DELETE DISEASE
// ADMIN ONLY
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  diseaseMasterController.deleteDisease
);


module.exports = router;