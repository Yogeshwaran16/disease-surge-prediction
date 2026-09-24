import { create } from "zustand";


// ============================================
// DEFAULT DASHBOARD STATE
// ============================================

const initialDashboardState = {
  status: "loading",

  totalDistricts: 38,

  totalPredictions: 0,

  riskCounts: {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    CRITICAL: 0,
  },

  districtData: [],

  topRiskDistricts: [],

  latestPredictions: [],

  lastUpdated: null,

  event: null,

  timestamp: null,

  connected: false,

  error: null,
};


// ============================================
// DASHBOARD STORE
// ============================================

const useDashboardStore = create((set) => ({

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  ...initialDashboardState,


  // ==========================================
  // SET DASHBOARD DATA
  // ==========================================

  setDashboardData: (data) => {

    if (!data) {
      return;
    }

    set({
      status:
        data.status || "success",

      totalDistricts:
        data.total_districts ?? 38,

      totalPredictions:
        data.total_predictions ?? 0,

      riskCounts: {
        HIGH:
          data.risk_counts?.HIGH ?? 0,

        MEDIUM:
          data.risk_counts?.MEDIUM ?? 0,

        LOW:
          data.risk_counts?.LOW ?? 0,

        CRITICAL:
          data.risk_counts?.CRITICAL ?? 0,
      },

      districtData:
        Array.isArray(data.all_districts)
          ? data.all_districts
          : Array.isArray(data.district_data)
            ? data.district_data
            : [],

      topRiskDistricts:
        Array.isArray(
          data.top_risk_districts
        )
          ? data.top_risk_districts
          : [],

      latestPredictions:
        Array.isArray(
          data.latest_predictions
        )
          ? data.latest_predictions
          : [],

      lastUpdated:
        data.last_updated || null,

      event:
        data.event || null,

      timestamp:
        data.timestamp || null,

      error: null,
    });
  },


  // ==========================================
  // SET CONNECTION STATUS
  // ==========================================

  setConnected: (connected) => {

    set({
      connected,

      error: connected
        ? null
        : "Dashboard WebSocket disconnected",
    });

  },


  // ==========================================
  // SET ERROR
  // ==========================================

  setError: (error) => {

    set({
      error:
        error instanceof Error
          ? error.message
          : String(
              error || "Unknown error"
            ),
    });

  },


  // ==========================================
  // CLEAR ERROR
  // ==========================================

  clearError: () => {

    set({
      error: null,
    });

  },


  // ==========================================
  // RESET DASHBOARD
  // ==========================================

  resetDashboard: () => {

    set({
      ...initialDashboardState,
    });

  },

}));


export default useDashboardStore;