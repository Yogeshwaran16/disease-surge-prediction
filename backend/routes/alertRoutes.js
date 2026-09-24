const express = require("express");

const router = express.Router();

const alertController =
  require("../controllers/alertController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


// =============================================
// GET ALERT STATISTICS
// =============================================

router.get(
  "/stats",
  authMiddleware,
  alertController.getAlertStats
);


// =============================================
// INTERNAL AUTOMATIC ALERT SCAN
// CELERY USE ONLY
// =============================================

router.post(
  "/scan-internal",
  alertController.scanAndGenerateAlertsInternal
);


// =============================================
// MANUAL AUTOMATIC ALERT SCAN
// ADMIN / HEALTH OFFICER
// =============================================

router.post(
  "/scan",
  authMiddleware,
  authorizeRoles(
    "admin",
    "health_officer"
  ),
  alertController.scanAndGenerateAlerts
);


// =============================================
// GET ALERT DELIVERY STATUS
// =============================================

router.get(
  "/:id/delivery",
  authMiddleware,
  alertController.getAlertDeliveryStatus
);


// =============================================
// GET ALL ALERTS
// =============================================

router.get(
  "/",
  authMiddleware,
  alertController.getAllAlerts
);


// =============================================
// RESOLVE ALERT
// ADMIN / HEALTH OFFICER
// =============================================

router.put(
  "/:id/resolve",
  authMiddleware,
  authorizeRoles(
    "admin",
    "health_officer"
  ),
  alertController.resolveAlert
);


// =============================================
// SEND ALERT NOTIFICATION
// ADMIN / HEALTH OFFICER
// =============================================

router.post(
  "/:id/notify",
  authMiddleware,
  authorizeRoles(
    "admin",
    "health_officer"
  ),
  alertController.sendAlertNotification
);


module.exports = router;
// =============================================
// INTERNAL CELERY NOTIFICATION
// SERVICE-TO-SERVICE ONLY
// =============================================

router.post(
  "/internal/:id/notify",
  alertController.sendInternalAlertNotification
);

