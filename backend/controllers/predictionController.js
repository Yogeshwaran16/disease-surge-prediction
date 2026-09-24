const mongoose = require("mongoose");

const Prediction =
  require("../models/Prediction");

const Alert =
  require("../models/Alert");


// =============================================
// GET ALL PREDICTIONS
// =============================================

exports.getPredictions =
  async (req, res) => {

    try {

      let filter = {};


      // =========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // =========================================

      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const predictions =
        await Prediction.find(filter)
          .sort({
            surge_probability: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          predictions.length,

        data:
          predictions,

      });

    } catch (error) {

      console.error(
        "Prediction Fetch Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch predictions",

      });

    }

  };


// =============================================
// GET SINGLE PREDICTION
// =============================================

exports.getPredictionById =
  async (req, res) => {

    try {

      const predictionId =
        req.params.id;


      // =========================================
      // VALIDATE MONGODB ID
      // =========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          predictionId
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid prediction ID",

        });

      }


      let filter = {

        _id:
          predictionId,

      };


      // =========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // =========================================

      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const prediction =
        await Prediction.findOne(
          filter
        );


      if (!prediction) {

        return res.status(404).json({

          success: false,

          message:
            "Prediction not found or access denied",

        });

      }


      return res.status(200).json({

        success: true,

        data:
          prediction,

      });

    } catch (error) {

      console.error(
        "Prediction Fetch By ID Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch prediction",

      });

    }

  };


// =============================================
// CREATE PREDICTION
// + AUTOMATIC ALERT GENERATION
// + DUPLICATE ALERT PREVENTION
// =============================================

exports.createPrediction =
  async (req, res) => {

    try {

      const predictionData = {

        ...req.body,

      };


      // =========================================
      // HEALTH OFFICER DISTRICT ENFORCEMENT
      // =========================================

      if (
        req.user.role ===
        "health_officer"
      ) {

        predictionData.district =
          req.user.district;

      }


      // =========================================
      // CREATE PREDICTION
      // =========================================

      const prediction =
        await Prediction.create(
          predictionData
        );


      let alert = null;

      let existingAlert = null;


      // =========================================
      // AUTOMATIC ALERT GENERATION
      // HIGH OR MEDIUM RISK
      // =========================================

      if (
        prediction.risk_level ===
          "HIGH" ||
        prediction.risk_level ===
          "MEDIUM"
      ) {

        let priority =
          "MEDIUM";


        // =======================================
        // HIGH RISK
        // =======================================

        if (
          prediction.risk_level ===
          "HIGH"
        ) {

          priority =
            "HIGH";

        }


        // =======================================
        // CRITICAL PROBABILITY
        // =======================================

        if (
          Number(
            prediction.surge_probability
          ) >= 0.85
        ) {

          priority =
            "CRITICAL";

        }


        // =======================================
        // CHECK EXISTING ACTIVE ALERT
        // SAME DISTRICT + SAME DISEASE
        // =======================================

        existingAlert =
          await Alert.findOne({

            district:
              prediction.district,

            disease:
              prediction.disease,

            resolved:
              false,

          });


        // =======================================
        // CREATE ALERT ONLY IF NOT EXISTS
        // =======================================

        if (!existingAlert) {

          alert =
            await Alert.create({

              district:
                prediction.district,

              disease:
                prediction.disease,

              risk_level:
                prediction.risk_level,

              probability:
                prediction.surge_probability,

              priority,

              message:
                `${prediction.disease} surge risk detected in ${prediction.district}. Risk level: ${prediction.risk_level}. Expected cases in 2 weeks: ${prediction.expected_cases_2w}`,

            });

        }

      }


      // =========================================
      // SUCCESS RESPONSE
      // =========================================

      return res.status(201).json({

        success: true,

        message:
          "Prediction created successfully",

        data:
          prediction,

        alert_created:
          alert !== null,

        existing_alert:
          existingAlert !== null,

        alert:
          alert ||
          existingAlert,

      });

    } catch (error) {

      console.error(
        "Prediction Create Error:",
        error
      );


      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to create prediction",

      });

    }

  };


// =============================================
// PREDICTION STATISTICS
// =============================================

exports.getPredictionStats =
  async (req, res) => {

    try {

      let filter = {};


      // =========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // =========================================

      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      // =========================================
      // TOTAL PREDICTIONS
      // =========================================

      const totalPredictions =
        await Prediction.countDocuments(
          filter
        );


      // =========================================
      // RISK LEVEL COUNTS
      // =========================================

      const highRisk =
        await Prediction.countDocuments({

          ...filter,

          risk_level:
            "HIGH",

        });


      const mediumRisk =
        await Prediction.countDocuments({

          ...filter,

          risk_level:
            "MEDIUM",

        });


      const lowRisk =
        await Prediction.countDocuments({

          ...filter,

          risk_level:
            "LOW",

        });


      // =========================================
      // CRITICAL PREDICTIONS
      // PROBABILITY >= 0.85
      // =========================================

      const criticalPredictions =
        await Prediction.countDocuments({

          ...filter,

          surge_probability: {

            $gte:
              0.85,

          },

        });


      // =========================================
      // AVERAGE SURGE PROBABILITY
      // =========================================

      const averageResult =
        await Prediction.aggregate([

          {

            $match:
              filter,

          },

          {

            $group: {

              _id:
                null,

              averageProbability: {

                $avg:
                  "$surge_probability",

              },

            },

          },

        ]);


      const averageSurgeProbability =

        averageResult.length > 0 &&
        averageResult[0]
          .averageProbability !==
          null

          ? Number(

              averageResult[0]
                .averageProbability
                .toFixed(4)

            )

          : 0;


      // =========================================
      // RESPONSE
      // =========================================

      return res.status(200).json({

        success: true,

        data: {

          total_predictions:
            totalPredictions,

          high_risk:
            highRisk,

          medium_risk:
            mediumRisk,

          low_risk:
            lowRisk,

          critical_predictions:
            criticalPredictions,

          average_surge_probability:
            averageSurgeProbability,

        },

      });

    } catch (error) {

      console.error(
        "Prediction Stats Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch prediction statistics",

      });

    }

  };


// =============================================
// DELETE PREDICTION
// =============================================

exports.deletePrediction =
  async (req, res) => {

    try {

      const predictionId =
        req.params.id;


      // =========================================
      // VALIDATE MONGODB ID
      // =========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          predictionId
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid prediction ID",

        });

      }


      let filter = {

        _id:
          predictionId,

      };


      // =========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // =========================================

      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const prediction =
        await Prediction.findOneAndDelete(
          filter
        );


      if (!prediction) {

        return res.status(404).json({

          success: false,

          message:
            "Prediction not found or access denied",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Prediction deleted successfully",

        data:
          prediction,

      });

    } catch (error) {

      console.error(
        "Prediction Delete Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to delete prediction",

      });

    }

  };