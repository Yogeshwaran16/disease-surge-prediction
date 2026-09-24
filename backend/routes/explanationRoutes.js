const express = require("express");
const axios = require("axios");

const router = express.Router();

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8001";

const {
  getAllShapData,
  getDistrictShap,
} = require(
  "../controllers/shapController"
);

/**
 * Check Python AI Explainability Service
 */
router.get(
  "/health",
  async (req, res) => {

    try {

      const response =
        await axios.get(
          `${AI_SERVICE_URL}/api/v1/explanations/health`
        );

      res.json({
        success: true,
        ai_service: response.data,
      });

    } catch (error) {

      res.status(503).json({
        success: false,
        message:
          "AI Explainability Service is unavailable",
        error: error.message,
      });

    }

  }
);

// ============================================
// GET ALL SHAP DATA
// ============================================

router.get(
  "/shap",
  getAllShapData
);


// ============================================
// GET SHAP DATA FOR DISTRICT
// ============================================

router.get(
  "/shap/:district",
  getDistrictShap
);


/**
 * Generate SHAP-based explanation
 */
router.post(
  "/",
  async (req, res) => {

    try {

      const response =
        await axios.post(
          `${AI_SERVICE_URL}/api/v1/explanations/`,
          req.body,
        );

      res.status(200).json({
        success: true,
        data: response.data,
      });

    } catch (error) {

      const status =
        error.response?.status || 500;

      res.status(status).json({
        success: false,
        message:
          "Failed to generate explanation",
        error:
          error.response?.data ||
          error.message,
      });

    }

  }
);


module.exports = router;