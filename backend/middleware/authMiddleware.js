const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // ============================================
    // GET TOKEN FROM HEADER
    // ============================================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];


    // ============================================
    // VERIFY JWT TOKEN
    // ============================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // ============================================
    // FIND USER IN DATABASE
    // ============================================

    const user = await User.findById(
      decoded.id
    ).select("-password");


    // ============================================
    // CHECK USER EXISTS
    // ============================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }


    // ============================================
    // CHECK ACCOUNT STATUS
    // ============================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }


    // ============================================
    // ATTACH USER TO REQUEST
    // ============================================

    req.user = user;

    next();

  } catch (error) {

    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });

  }
};


module.exports = authMiddleware;