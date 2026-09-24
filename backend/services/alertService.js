const Alert = require("../models/Alert");
const Prediction = require("../models/Prediction");
const District = require("../models/District");
const notificationService = require("./notifications/notificationService");

class AlertService {

  // =============================================
  // GENERATE ALERT FOR ONE DISTRICT
  // =============================================

  async generateAlert(district) {

    const prediction =
      await Prediction.findOne({
        district,
      }).sort({
        createdAt: -1,
      });

    if (!prediction) {
      return null;
    }


    // ===========================================
    // LOW RISK = BELOW ALERT THRESHOLD
    // ===========================================

    if (
      prediction.risk_level === "LOW"
    ) {

      return {
        district:
          prediction.district,

        disease:
          prediction.disease,

        risk_level:
          prediction.risk_level,

        probability:
          prediction.surge_probability,

        priority:
          "LOW",

        status:
          "below_threshold",

        duplicate:
          false,
      };
    }


    // ===========================================
    // PREVENT DUPLICATE ALERT
    // ===========================================

    const existingAlert =
      await Alert.findOne({

        district:
          prediction.district,

        disease:
          prediction.disease,

        risk_level:
          prediction.risk_level,

        probability:
          prediction.surge_probability,

        issued_at: {
          $gte:
            prediction.createdAt,
        },

      }).sort({
        issued_at: -1,
      });


    if (existingAlert) {

      return {

        alert_id:
          existingAlert._id,

        district:
          existingAlert.district,

        disease:
          existingAlert.disease,

        risk_level:
          existingAlert.risk_level,

        probability:
          existingAlert.probability,

        priority:
          existingAlert.priority,

        english_alert:
          existingAlert.english_alert,

        tamil_alert:
          existingAlert.tamil_alert,

        delivery:
          existingAlert.delivery_summary,

        duplicate:
          true,

      };
    }


    // ===========================================
    // PRIORITY
    // ===========================================

    let priority =
      "MEDIUM";

    if (
      prediction.risk_level ===
      "HIGH"
    ) {

      priority =
        "CRITICAL";

    }


    // ===========================================
    // MULTILINGUAL ALERT MESSAGE
    // ===========================================

    const englishAlert =
      `${prediction.disease} surge risk detected in ${district}. ` +
      `Expected cases: ${prediction.expected_cases_2w}`;


    const tamilAlert =
      `${district} பகுதியில் ${prediction.disease} ` +
      `நோய் அதிகரிக்கும் அபாயம் கண்டறியப்பட்டுள்ளது. ` +
      `எதிர்பார்க்கப்படும் 2 வார வழக்குகள்: ` +
      `${prediction.expected_cases_2w}`;


    // ===========================================
    // CREATE ALERT
    // ===========================================

    const alert =
      await Alert.create({

        district,

        disease:
          prediction.disease,

        risk_level:
          prediction.risk_level,

        probability:
          prediction.surge_probability,

        priority,

        message:
          englishAlert,

        english_alert:
          englishAlert,

        tamil_alert:
          tamilAlert,

      });


    // ===========================================
    // SEND NOTIFICATIONS
    // ===========================================

    let delivery =
      null;

    try {

      delivery =
        await notificationService.sendAlert(
          alert
        );

    } catch (error) {

      console.error(
        "Notification delivery error:",
        error.message
      );

    }


    // ===========================================
    // RESPONSE
    // ===========================================

    return {

      alert_id:
        alert._id,

      district,

      disease:
        prediction.disease,

      risk_level:
        prediction.risk_level,

      probability:
        prediction.surge_probability,

      priority,

      english_alert:
        englishAlert,

      tamil_alert:
        tamilAlert,

      delivery,

      duplicate:
        false,

    };

  }


  // =============================================
  // SCAN ALL TAMIL NADU DISTRICTS
  // =============================================

  async scanAndGenerateAlerts() {

    const districts =
      await District.find({
        region: "Tamil Nadu",
      }).select("name");


    const results = [];

    let alertsGenerated = 0;
    let belowThreshold = 0;
    let duplicates = 0;
    let failed = 0;


    // ===========================================
    // PROCESS EACH DISTRICT
    // ===========================================

    for (
      const district of districts
    ) {

      try {

        const result =
          await this.generateAlert(
            district.name
          );


        if (!result) {
          continue;
        }


        results.push(result);


        // ========================================
        // COUNT RESULT TYPE
        // ========================================

        if (
          result.status ===
          "below_threshold"
        ) {

          belowThreshold++;

        } else if (
          result.duplicate ===
          true
        ) {

          duplicates++;

        } else {

          alertsGenerated++;

        }

      } catch (error) {

        failed++;

        results.push({

          district:
            district.name,

          status:
            "failed",

          error:
            error.message,

        });

      }

    }


    // ===========================================
    // FINAL SCAN SUMMARY
    // ===========================================

    return {

      districts_scanned:
        districts.length,

      alerts_generated:
        alertsGenerated,

      below_threshold:
        belowThreshold,

      duplicates:
        duplicates,

      failed:
        failed,

      results,

    };

  }

}


module.exports =
  new AlertService();