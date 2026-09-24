const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const PasswordResetToken =
  require("../models/PasswordResetToken");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// ============================================
// TOKEN SETTINGS
// ============================================

const ACCESS_TOKEN_EXPIRES =
  process.env.ACCESS_TOKEN_EXPIRES || "1h";

const REFRESH_TOKEN_DAYS =
  Number(process.env.REFRESH_TOKEN_DAYS) || 7;


// ============================================
// GENERATE ACCESS TOKEN
// ============================================

const generateAccessToken = (user) => {

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      district: user.district,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    }
  );

};


// ============================================
// HASH REFRESH TOKEN
// ============================================

const hashToken = (token) => {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

};


// ============================================
// CREATE REFRESH TOKEN
// ============================================

const createRefreshToken = async (userId) => {

  const token =
    crypto.randomBytes(64).toString("hex");

  const tokenHash =
    hashToken(token);

  const expiresAt =
    new Date(
      Date.now() +
      REFRESH_TOKEN_DAYS *
      24 *
      60 *
      60 *
      1000
    );


  await RefreshToken.create({

    user: userId,

    tokenHash,

    expiresAt,

    isRevoked: false,

  });


  return token;

};


// ============================================
// REGISTER USER
// ============================================

exports.register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
      district,
    } = req.body;


    if (!name || !email || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Name, email and password are required.",

      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const existingUser =
      await User.findOne({

        email:
          normalizedEmail,

      });


    if (existingUser) {

      return res.status(409).json({

        success: false,

        message:
          "User already exists with this email.",

      });

    }


    const allowedRoles = [

      "admin",

      "health_officer",

      "viewer",

    ];


   const userRole = "viewer";

    if (
      !allowedRoles.includes(
        userRole
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid role.",

      });

    }


    const user =
      await User.create({

        name: name.trim(),

        email:
          normalizedEmail,

        password,

        role: "viewer",
district: null,

      });


    return res.status(201).json({

      success: true,

      message:
        "User registered successfully.",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        district:
          user.district,

      },

    });

  } catch (error) {

    console.error(
      "Registration Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};


// ============================================
// LOGIN
// ============================================

exports.login = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Email and password are required.",

      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({

        email:
          normalizedEmail,

      }).select("+password");


    if (!user) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email or password.",

      });

    }


    if (!user.isActive) {

      return res.status(403).json({

        success: false,

        message:
          "User account is inactive.",

      });

    }


    const validPassword =
      await user.comparePassword(
        password
      );


    if (!validPassword) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email or password.",

      });

    }


    // UPDATE LAST LOGIN

    user.lastLogin =
      new Date();

    await user.save();


    // GENERATE TOKENS

    const accessToken =
      generateAccessToken(user);

    const refreshToken =
      await createRefreshToken(
        user._id
      );


    return res.status(200).json({

      success: true,

      message:
        "Login successful.",

      accessToken,

      refreshToken,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        district:
          user.district,

      },

    });

  } catch (error) {

    console.error(
      "Login Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};


// ============================================
// REFRESH ACCESS TOKEN
// ROTATES REFRESH TOKEN
// ============================================

exports.refresh = async (req, res) => {

  try {

    const {
      refreshToken,
    } = req.body;


    if (!refreshToken) {

      return res.status(400).json({

        success: false,

        message:
          "Refresh token is required.",

      });

    }


    const tokenHash =
      hashToken(refreshToken);


    const storedToken =
      await RefreshToken.findOne({

        tokenHash,

        isRevoked: false,

      }).populate("user");


    if (
      !storedToken ||
      !storedToken.user
    ) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid refresh token.",

      });

    }


    if (
      storedToken.expiresAt <
      new Date()
    ) {

      storedToken.isRevoked =
        true;

      await storedToken.save();


      return res.status(401).json({

        success: false,

        message:
          "Refresh token expired.",

      });

    }


    if (
      !storedToken.user.isActive
    ) {

      return res.status(403).json({

        success: false,

        message:
          "User account is inactive.",

      });

    }


    // REVOKE OLD TOKEN
    // TOKEN ROTATION

    storedToken.isRevoked =
      true;

    await storedToken.save();


    // CREATE NEW TOKENS

    const accessToken =
      generateAccessToken(
        storedToken.user
      );

    const newRefreshToken =
      await createRefreshToken(
        storedToken.user._id
      );


    return res.status(200).json({

      success: true,

      message:
        "Token refreshed successfully.",

      accessToken,

      refreshToken:
        newRefreshToken,

    });

  } catch (error) {

    console.error(
      "Refresh Token Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};


// ============================================
// LOGOUT
// ============================================

exports.logout = async (req, res) => {

  try {

    const {
      refreshToken,
    } = req.body;


    if (!refreshToken) {

      return res.status(400).json({

        success: false,

        message:
          "Refresh token is required.",

      });

    }


    const tokenHash =
      hashToken(refreshToken);


    const storedToken =
      await RefreshToken.findOne({

        tokenHash,

        isRevoked: false,

      });


    if (storedToken) {

      storedToken.isRevoked =
        true;

      await storedToken.save();

    }


    return res.status(200).json({

      success: true,

      message:
        "Logout successful.",

    });

  } catch (error) {

    console.error(
      "Logout Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};

// ============================================
// FORGOT PASSWORD
// ============================================

exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;


    if (!email) {

      return res.status(400).json({

        success: false,

        message: "Email is required.",

      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({

        email: normalizedEmail,

      });


    // Security:
    // Don't reveal whether email exists

    if (!user) {

      return res.status(200).json({

        success: true,

        message:
          "If the email exists, a password reset token has been generated.",

      });

    }


    // Delete old unused reset tokens

    await PasswordResetToken.deleteMany({

      user: user._id,

      isUsed: false,

    });


    // Generate random reset token

    const resetToken =
      crypto.randomBytes(32).toString("hex");


    // Hash token before storing

    const tokenHash =
      hashToken(resetToken);


    // Token expires in 15 minutes

    const expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );


    await PasswordResetToken.create({

      user: user._id,

      tokenHash,

      expiresAt,

      isUsed: false,

    });


    // Development response
    // Later we will send this through Email

    return res.status(200).json({

      success: true,

      message:
        "Password reset token generated successfully.",

      resetToken,

      expiresIn:
        "15 minutes",

    });

  } catch (error) {

    console.error(
      "Forgot Password Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};


// ============================================
// RESET PASSWORD
// ============================================

exports.resetPassword = async (req, res) => {

  try {

    const {

      resetToken,

      newPassword,

    } = req.body;


    if (
      !resetToken ||
      !newPassword
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Reset token and new password are required.",

      });

    }


    if (newPassword.length < 6) {

      return res.status(400).json({

        success: false,

        message:
          "Password must be at least 6 characters.",

      });

    }


    const tokenHash =
      hashToken(resetToken);


    const storedToken =
      await PasswordResetToken
        .findOne({

          tokenHash,

          isUsed: false,

        });


    if (!storedToken) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid or already used reset token.",

      });

    }


    if (
      storedToken.expiresAt <
      new Date()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Password reset token has expired.",

      });

    }


    const user =
      await User.findById(
        storedToken.user
      ).select("+password");


    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found.",

      });

    }


    // Update password
    // User model will hash it automatically

    user.password =
      newPassword;

    await user.save();


    // Mark reset token as used

    storedToken.isUsed =
      true;

    await storedToken.save();


    // Security:
    // Logout all existing sessions

    await RefreshToken.updateMany(

      {

        user: user._id,

        isRevoked: false,

      },

      {

        isRevoked: true,

      }

    );


    return res.status(200).json({

      success: true,

      message:
        "Password reset successful. Please login again.",

    });

  } catch (error) {

    console.error(
      "Reset Password Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

    });

  }

};