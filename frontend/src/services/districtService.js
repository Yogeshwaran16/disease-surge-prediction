import axios from "axios";

const DISTRICT_API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

DISTRICT_API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

DISTRICT_API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("District API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      message:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message,
    });

    return Promise.reject(error);
  }
);

const districtService = {
  // All district names
  async getAllDistricts() {
    const response = await DISTRICT_API.get("/districts");
    return response.data;
  },

  // Module 10 district ranking
  async getDistrictRanking() {
    const response =
      await DISTRICT_API.get("/districts/ranking");

    return response.data;
  },

  // Selected district analysis
  async getDistrictAnalysis(districtName) {
    const response =
      await DISTRICT_API.get(
        `/districts/${encodeURIComponent(districtName)}`
      );

    return response.data;
  },
};

export default districtService; 