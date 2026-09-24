const Alert =
  require("../models/Alert");

const alertService =
  require("../services/alertService");


// =============================================
// GET ALL ALERTS
// =============================================

exports.getAllAlerts =
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


      const alerts =
        await Alert.find(filter)
          .sort({
            issued_at: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          alerts.length,

        data:
          alerts,

      });

    } catch (error) {

      console.error(
        "Alert Fetch Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// =============================================
// GET ALERT STATISTICS
// =============================================

exports.getAlertStats =
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


      const totalAlerts =
        await Alert.countDocuments(
          filter
        );


      const activeAlerts =
        await Alert.countDocuments({

          ...filter,

          resolved:
            false,

        });


      const resolvedAlerts =
        await Alert.countDocuments({

          ...filter,

          resolved:
            true,

        });


      const highRiskAlerts =
        await Alert.countDocuments({

          ...filter,

          risk_level:
            "HIGH",

        });


      const criticalAlerts =
        await Alert.countDocuments({

          ...filter,

          priority:
            "CRITICAL",

          resolved:
            false,

        });


      return res.status(200).json({

        success: true,

        data: {

          total_alerts:
            totalAlerts,

          active_alerts:
            activeAlerts,

          resolved_alerts:
            resolvedAlerts,

          high_risk_alerts:
            highRiskAlerts,

          critical_alerts:
            criticalAlerts,

        },

      });

    } catch (error) {

      console.error(
        "Alert Stats Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// =============================================
// GET ALERT DELIVERY STATUS
// =============================================

exports.getAlertDeliveryStatus =
  async (req, res) => {

    try {

      let filter = {

        _id:
          req.params.id,

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


      const alert =
        await Alert.findOne(filter)
          .select(
            "_id district disease risk_level priority deliveries delivery_summary issued_at"
          );


      if (!alert) {

        return res.status(404).json({

          success: false,

          message:
            "Alert not found or access denied",

        });

      }


      return res.status(200).json({

        success: true,

        data: {

          alert_id:
            alert._id,

          district:
            alert.district,

          disease:
            alert.disease,

          risk_level:
            alert.risk_level,

          priority:
            alert.priority,

          deliveries:
            alert.deliveries,

          delivery_summary:
            alert.delivery_summary,

          issued_at:
            alert.issued_at,

        },

      });

    } catch (error) {

      console.error(
        "Alert Delivery Status Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// =============================================
// AUTOMATIC ALERT SCAN
// AUTHENTICATED / MANUAL USE
// =============================================

exports.scanAndGenerateAlerts =
  async (req, res) => {

    try {

      const result =
        await alertService.scanAndGenerateAlerts();


      return res.status(200).json({

        success: true,

        message:
          "Automatic alert scan completed",

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Automatic Alert Scan Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Automatic alert scan failed",

        error:
          error.message,

      });

    }

  };


// =============================================
// INTERNAL AUTOMATIC ALERT SCAN
// CELERY USE ONLY
// =============================================

exports.scanAndGenerateAlertsInternal =
  async (req, res) => {

    try {

      const remoteAddress =
        req.socket.remoteAddress;


      // =========================================
      // ALLOW LOCALHOST ONLY
      // =========================================

      const isLocalRequest =
        remoteAddress ===
          "127.0.0.1" ||

        remoteAddress ===
          "::1" ||

        remoteAddress ===
          "::ffff:127.0.0.1";


      if (!isLocalRequest) {

        return res.status(403).json({

          success: false,

          message:
            "Internal scanner access denied",

        });

      }


      // =========================================
      // RUN ALERT SCANNER
      // =========================================

      const result =
        await alertService.scanAndGenerateAlerts();


      return res.status(200).json({

        success: true,

        message:
          "Internal automatic alert scan completed",

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Internal Alert Scan Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Internal alert scan failed",

        error:
          error.message,

      });

    }

  };


// =============================================
// RESOLVE ALERT
// =============================================

exports.resolveAlert =
  async (req, res) => {

    try {

      let filter = {

        _id:
          req.params.id,

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


      const alert =
        await Alert.findOneAndUpdate(

          filter,

          {

            resolved:
              true,

            resolved_at:
              new Date(),

          },

          {

            new:
              true,

          }

        );


      if (!alert) {

        return res.status(404).json({

          success: false,

          message:
            "Alert not found or access denied",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Alert resolved successfully",

        data:
          alert,

      });

    } catch (error) {

      console.error(
        "Resolve Alert Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// =============================================
// SEND ALERT NOTIFICATION
// =============================================

exports.sendAlertNotification =
  async (req, res) => {

    try {

      const alert =
        await Alert.findById(
          req.params.id
        );


      if (!alert) {

        return res.status(404).json({

          success: false,

          message:
            "Alert not found",

        });

      }


      // =========================================
      // HEALTH OFFICER
      // OWN DISTRICT ONLY
      // =========================================

      if (
        req.user.role ===
          "health_officer" &&
        alert.district !==
          req.user.district
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Access denied for this district",

        });

      }


      const notificationService =
        require("../services/notifications/notificationService");


      const result =
        await notificationService.sendAlert(
          alert
        );


      return res.status(200).json({

        success: true,

        message:
          "Alert notification process completed",

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Alert Notification Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };
// =============================================
// INTERNAL CELERY NOTIFICATION
// SERVICE-TO-SERVICE ONLY
// =============================================

exports.sendInternalAlertNotification =
  async (req, res) => {

    try {

      const expectedSecret =
        process.env.TECHNOVA_INTERNAL_SERVICE_SECRET;

      const providedSecret =
        req.headers["x-technova-internal-secret"];

      if (
        !expectedSecret ||
        !providedSecret ||
        providedSecret !== expectedSecret
      ) {

        return res.status(401).json({

          success: false,

          message:
            "Unauthorized internal service request",

        });

      }

      const alert =
        await Alert.findById(
          req.params.id
        );

      if (!alert) {

        return res.status(404).json({

          success: false,

          message:
            "Alert not found",

        });

      }

      const notificationService =
        require("../services/notifications/notificationService");

      const result =
        await notificationService.sendAlert(
          alert
        );

      return res.status(200).json({

        success: true,

        message:
          "Internal alert notification process completed",

        data:
          result,

      });

    } catch (error) {

      console.error(
        "Internal Alert Notification Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };

