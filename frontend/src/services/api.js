import axios from "axios";

// ============================================================
// API BASE CONFIGURATION
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  // General API timeout
  timeout: 30000,
});


// ============================================================
// REQUEST INTERCEPTOR
// ADD JWT ACCESS TOKEN
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// GLOBAL ERROR HANDLING
// ============================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error("API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      code: error?.code,
      message:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message,
    });

    return Promise.reject(error);
  }
);


// ============================================================
// ROOT HEALTH
// ============================================================

export const getDashboardRiskTrend = async (weeks = 12) => {
  const response = await API.get(
  "/api/v1/dashboard/trend",
    {
      params: {
        weeks: Math.max(1, Number(weeks) || 12),
      },
    }
  );

  return response.data;
};

export const getDashboardSummary = async () => {
  try {
    const response = await API.get(
      "/api/v1/dashboard/summary",
      {
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Dashboard Summary API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      code: error?.code,
      message: error?.message,
    });

    throw error;
  }
};
export const getRecentAlerts = async () => {
  const response = await API.get(
    "/api/v1/dashboard/alerts"
  );

  return response.data;
};


// ============================================================
// MODULE 8
// BACKEND ALERTS FEED
// NODE / EXPRESS API
// ============================================================

export const getBackendAlerts = async () => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  try {
    const response = await axios.get(
      "http://127.0.0.1:5000/api/alerts",
      {
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Backend Alerts API Error:",
      error
    );

    throw error;
  }
};


// ============================================================
// MODULE 8
// ALERT DELIVERY STATUS
// NODE / EXPRESS API
// ============================================================

export const getAlertDeliveryStatus = async (
  alertId
) => {
  const cleanAlertId = String(
    alertId || ""
  ).trim();

  if (!cleanAlertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  try {
    const response = await axios.get(
      `http://127.0.0.1:5000/api/alerts/${encodeURIComponent(
        cleanAlertId
      )}/delivery`,
      {
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Alert Delivery Status API Error:",
      error
    );

    throw error;
  }
};


// ============================================================
// MODULE 8
// SEND / RETRY ALERT NOTIFICATION
// NODE / EXPRESS API
// ============================================================

export const sendAlertNotification = async (
  alertId
) => {
  const cleanAlertId = String(
    alertId || ""
  ).trim();

  if (!cleanAlertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  try {
    const response = await axios.post(
      `http://127.0.0.1:5000/api/alerts/${encodeURIComponent(
        cleanAlertId
      )}/notify`,
      {},
      {
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Alert Notification API Error:",
      error
    );

    throw error;
  }
};


// ============================================================
// RECOMMENDED ACTIONS HELPER
// ============================================================

const getRecommendedActions = (
  riskLevel
) => {
  const risk = String(
    riskLevel || "LOW"
  )
    .toUpperCase()
    .trim();

  const actions = {
    CRITICAL: [
      "Activate emergency response team",
      "Increase hospital surge capacity",
      "Deploy immediate disease control measures",
      "Issue emergency public health alert",
    ],

    HIGH: [
      "Increase disease surveillance",
      "Deploy additional health workers",
      "Prepare hospital surge capacity",
      "Increase public awareness activities",
    ],

    MEDIUM: [
      "Monitor disease trends closely",
      "Increase community awareness",
      "Review district preparedness",
      "Conduct targeted surveillance",
    ],

    LOW: [
      "Continue routine disease surveillance",
      "Maintain prevention awareness",
      "Monitor disease trends regularly",
      "Continue standard health preparedness",
    ],
  };

  return actions[risk] || actions.LOW;
};


// ============================================================
// DISTRICT ALERT
// ============================================================

export const getDistrictAlert = async (
  district = "Chennai"
) => {
  const cleanDistrict = String(
    district || ""
  ).trim();

  if (!cleanDistrict) {
    throw new Error(
      "Please enter a district name"
    );
  }

  try {
    const response = await API.get(
      `/api/v1/alerts/district/${encodeURIComponent(
        cleanDistrict
      )}`
    );

    const responseData = response.data;

    const alerts =
      responseData?.data ||
      responseData?.alerts ||
      [];

    if (
      !Array.isArray(alerts) ||
      alerts.length === 0
    ) {
      throw new Error(
        "No alert found for this district"
      );
    }

    const alert = alerts[0];

    return {
      success: true,

      status: "success",

      district:
        alert.district ||
        cleanDistrict,

      disease:
        alert.disease ||
        "Disease Surveillance",

      alert_level:
        alert.risk_level ||
        alert.alert_level ||
        "LOW",

      risk_level:
        alert.risk_level ||
        alert.alert_level ||
        "LOW",

      message:
        alert.english_alert ||
        alert.message ||
        "No English alert available",

      english_alert:
        alert.english_alert ||
        alert.message ||
        "No English alert available",

      tamil_alert:
        alert.tamil_alert ||
        "தமிழ் எச்சரிக்கை கிடைக்கவில்லை",

      recommended_actions:
        alert.recommended_actions ||
        getRecommendedActions(
          alert.risk_level ||
            alert.alert_level
        ),

      raw_alert: alert,
    };
  } catch (error) {
    console.error(
      "District Alert API Error:",
      error
    );

    throw error;
  }
};


// ============================================================
// DATA SOURCES
// ============================================================

export const getDataSources = async () => {
  try {
    const response = await API.get(
      "/api/v1/data-sources"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Data Sources API Error:",
      error
    );

    return {
      success: false,
      data: [],
    };
  }
};


// ============================================================
// SHAP ANALYSIS
// NODE / EXPRESS API
// ============================================================

export const getDistrictShap = async (
  district = "Chennai"
) => {
  try {
    const cleanDistrict = String(
      district || ""
    ).trim();

    if (!cleanDistrict) {
      throw new Error(
        "District is required"
      );
    }

    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    const response = await axios.get(
      `http://127.0.0.1:5000/api/shap/${encodeURIComponent(
        cleanDistrict
      )}`,
      {
        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "SHAP API Error:",
      error
    );

    return {
      success: false,
      data: [],
    };
  }
};


// ============================================================
// VALIDATION SCORECARD
// NODE / EXPRESS API
// ============================================================

export const getValidationScorecard =
  async () => {
    try {
      const token =
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:5000/api/validation",
        {
          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          timeout: 15000,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Validation API Error:",
        error
      );

      return {
        success: false,
        validation: null,
      };
    }
  };


// ============================================================
// FEATURE STORE HEALTH
// ============================================================

export const getFeatureStoreHealth =
  async () => {
    const response = await API.get(
      "/api/v1/features/health"
    );

    return response.data;
  };


// ============================================================
// FEATURE STORE DATA
// DISTRICT + DISEASE
// ============================================================

export const getFeatureStoreData = async (
  district,
  disease
) => {
  const cleanDistrict = String(
    district || ""
  ).trim();

  const cleanDisease = String(
    disease || ""
  ).trim();

  if (!cleanDistrict) {
    throw new Error(
      "District is required"
    );
  }

  if (!cleanDisease) {
    throw new Error(
      "Disease is required"
    );
  }

  const response = await API.get(
    "/api/v1/features/search",
    {
      params: {
        district: cleanDistrict,
        disease: cleanDisease,
      },
    }
  );

  return response.data;
};


// ============================================================
// FEATURE STORE DISTRICTS
// ============================================================

export const getFeatureDistricts =
  async () => {
    const response = await API.get(
      "/api/v1/features/districts"
    );

    return response.data;
  };


// ============================================================
// FEATURE STORE DISEASES
// ============================================================

export const getFeatureDiseases =
  async () => {
    const response = await API.get(
      "/api/v1/features/diseases"
    );

    return response.data;
  };


// ============================================================
// FEATURE STORE ALL FEATURES
// ============================================================

export const getAllFeatures = async (
  skip = 0,
  limit = 100
) => {
  const response = await API.get(
    "/api/v1/features",
    {
      params: {
        skip: Math.max(
          0,
          Number(skip) || 0
        ),

        limit: Math.min(
          10000,
          Math.max(
            1,
            Number(limit) || 100
          )
        ),
      },
    }
  );

  return response.data;
};


// ============================================================
// FEATURE STORE BY DISTRICT
// ============================================================

export const getFeaturesByDistrict =
  async (district) => {
    const cleanDistrict = String(
      district || ""
    ).trim();

    if (!cleanDistrict) {
      throw new Error(
        "District is required"
      );
    }

    const response = await API.get(
      `/api/v1/features/district/${encodeURIComponent(
        cleanDistrict
      )}`
    );

    return response.data;
  };


// ============================================================
// FEATURE STORE LATEST
// ============================================================

export const getLatestFeature = async (
  district,
  disease
) => {
  const cleanDistrict = String(
    district || ""
  ).trim();

  const cleanDisease = String(
    disease || ""
  ).trim();

  if (
    !cleanDistrict ||
    !cleanDisease
  ) {
    throw new Error(
      "District and disease are required"
    );
  }

  const response = await API.get(
    `/api/v1/features/latest/${encodeURIComponent(
      cleanDistrict
    )}/${encodeURIComponent(
      cleanDisease
    )}`
  );

  return response.data;
};


// ============================================================
// FEATURE STORE COUNT
// ============================================================

export const getFeatureCount =
  async () => {
    const response = await API.get(
      "/api/v1/features/count"
    );

    return response.data;
  };


// ============================================================
// DEFAULT API EXPORT
// ============================================================

export default API;