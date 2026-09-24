export const ROLES = {

  ADMIN:
    "admin",

  HEALTH_OFFICER:
    "health_officer",

  VIEWER:
    "viewer",

};


export const PAGE_PERMISSIONS = {


  // ==========================================
  // DASHBOARD
  // ==========================================

  dashboard: [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],


  // ==========================================
  // PREDICTIONS
  // ==========================================

  predictions: [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],


  // ==========================================
  // DISTRICT ANALYSIS
  // ==========================================

  "district-analysis": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],

  // ==========================================
// DISTRICT MANAGEMENT
// ==========================================

"district-management": [

  ROLES.ADMIN,
  ROLES.HEALTH_OFFICER,
  ROLES.VIEWER,

],


  // ==========================================
  // VALIDATION SCORECARD
  // ==========================================

  "validation-scorecard": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],


  // ==========================================
  // SHAP ANALYSIS
  // ==========================================

  "shap-analysis": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],


  // ==========================================
  // AI RECOMMENDATIONS
  // ==========================================

  "ai-recommendations": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],


  // ==========================================
  // RESOURCE PLANNING
  // ==========================================

  "resource-planning": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],

  // ==========================================
  // REPORTS CENTER
  // ==========================================

  reports: [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],


  // ==========================================
  // DATA SOURCES
  // ==========================================

  "data-sources": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],


  // ==========================================
  // FEATURE STORE EXPLORER ⭐
  // ==========================================

  "feature-store": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],


  // ==========================================
  // ALERTS
  // ==========================================

  alerts: [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],


  // ==========================================
  // ALERT HISTORY
  // ==========================================

  "alert-history": [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,

  ],


  // ==========================================
  // ABOUT
  // ==========================================

  about: [

    ROLES.ADMIN,
    ROLES.HEALTH_OFFICER,
    ROLES.VIEWER,

  ],

};
