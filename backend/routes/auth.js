const express = require("express");

const router = express.Router();

const authController =
  require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// ============================================
// PUBLIC ROUTES
// ============================================

// REGISTER
router.post(
  "/register",
  authController.register
);


// LOGIN
router.post(
  "/login",
  authController.login
);


// REFRESH ACCESS TOKEN
router.post(
  "/refresh",
  authController.refresh
);


// LOGOUT
router.post(
  "/logout",
  authController.logout
);


// FORGOT PASSWORD
router.post(
  "/forgot-password",
  authController.forgotPassword
);


// RESET PASSWORD
router.post(
  "/reset-password",
  authController.resetPassword
);


// ============================================
// PROTECTED ROUTES
// ============================================

// PROFILE
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {

    res.json({
      success: true,
      user: req.user,
    });

  }
);


// ============================================
// ADMIN ONLY
// ============================================

router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {

    res.json({
      success: true,
      message: "Welcome Admin!",
    });

  }
);


// ============================================
// ADMIN + HEALTH OFFICER
// ============================================

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles(
    "admin",
    "health_officer"
  ),
  (req, res) => {

    res.json({
      success: true,
      message: "Dashboard Access Granted",
    });

  }
);


module.exports = router;