const Prediction =
  require("../models/Prediction");

const Alert =
  require("../models/Alert");


// ============================================
// DASHBOARD SUMMARY
// ============================================

exports.getDashboardSummary =
  async (req, res) => {

    try {

      let predictionFilter = {};


      // ==========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // ==========================================

      if (
        req.user &&
        req.user.role === "health_officer"
      ) {

        predictionFilter.district =
          req.user.district;

      }


      // ==========================================
      // TOTAL PREDICTIONS
      // ==========================================

      const totalPredictions =
        await Prediction.countDocuments(
          predictionFilter
        );


      // ==========================================
      // RISK COUNTS
      // ==========================================

      const highRisk =
        await Prediction.countDocuments({

          ...predictionFilter,

          risk_level: "HIGH"

        });


      const mediumRisk =
        await Prediction.countDocuments({

          ...predictionFilter,

          risk_level: "MEDIUM"

        });


      const lowRisk =
        await Prediction.countDocuments({

          ...predictionFilter,

          risk_level: "LOW"

        });


      // ==========================================
      // TOTAL DISTRICTS
      // ==========================================

      const districts =
        await Prediction.distinct(
          "district",
          predictionFilter
        );


      // ==========================================
      // AGGREGATION FILTER
      // ==========================================

      const matchStage = {};

      if (
        predictionFilter.district
      ) {

        matchStage.district =
          predictionFilter.district;

      }


      // ==========================================
      // GET HIGHEST RISK RECORD
      // FOR EACH DISTRICT
      // ==========================================

      const allDistrictPredictions =
        await Prediction.aggregate([

          {
            $match:
              matchStage
          },


          // Highest probability first

          {
            $sort: {
              surge_probability: -1
            }
          },


          // Group by district

          {
            $group: {

              _id: "$district",

              district: {
                $first: "$district"
              },

              disease: {
                $first: "$disease"
              },

              risk_level: {
                $first: "$risk_level"
              },

              surge_probability: {
                $first:
                  "$surge_probability"
              },

              expected_cases_2w: {
                $first:
                  "$expected_cases_2w"
              },

              year: {
                $first: "$year"
              },

              week_number: {
                $first:
                  "$week_number"
              },

              createdAt: {
                $first:
                  "$createdAt"
              }

            }

          },


          // Final sort

          {
            $sort: {
              surge_probability: -1
            }
          }

        ]);


      // ==========================================
      // TOP 10 HIGH RISK DISTRICTS
      // ==========================================

      const topRiskDistricts =
        allDistrictPredictions.slice(
          0,
          10
        );


      // ==========================================
      // ALERT STATISTICS
      // ==========================================

      let alertFilter = {};

      if (
        predictionFilter.district
      ) {

        alertFilter.district =
          predictionFilter.district;

      }


      const activeAlerts =
        await Alert.countDocuments({

          ...alertFilter,

          resolved: false

        });


      const criticalAlerts =
        await Alert.countDocuments({

          ...alertFilter,

          priority: "CRITICAL",

          resolved: false

        });


      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({

        success: true,


        summary: {

          totalPredictions,

          totalDistricts:
            districts.length,

          highRiskCount:
            highRisk,

          mediumRiskCount:
            mediumRisk,

          lowRiskCount:
            lowRisk,

          activeAlerts,

          criticalAlerts,

          forecastHorizon:
            "14-21 days",

          last_updated:
            new Date()

        },


        // TOP 10 DISTRICTS

        top_risk_districts:
          topRiskDistricts,


        // ALL DISTRICTS FOR MAP

        all_districts:
          allDistrictPredictions

      });

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to load dashboard"

      });

    }

  };


// ============================================
// RECENT ALERTS
// ACTUAL ALERT COLLECTION
// ============================================

exports.getRecentAlerts =
  async (req, res) => {

    try {

      let filter = {

        resolved: false

      };


      // ==========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // ==========================================

      if (
        req.user &&
        req.user.role === "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const alerts =
        await Alert.find(filter)
          .sort({

            priority: -1,

            issued_at: -1

          })
          .limit(10);


      return res.status(200).json({

        success: true,

        count:
          alerts.length,

        alerts

      });

    } catch (error) {

      console.error(
        "Recent Alerts Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };