const express = require("express");

const router = express.Router();

const userController =
  require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// ============================================
// GET ALL USERS
// ADMIN ONLY
// ============================================

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  userController.getAllUsers
);


// ============================================
// GET USER BY ID
// ADMIN ONLY
// ============================================

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.getUserById
);


// ============================================
// CREATE USER
// ADMIN ONLY
// ============================================

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  userController.createUser
);


// ============================================
// UPDATE USER
// ADMIN ONLY
// ============================================

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.updateUser
);


// ============================================
// DELETE USER
// ADMIN ONLY
// ============================================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.deleteUser
);


module.exports = router;