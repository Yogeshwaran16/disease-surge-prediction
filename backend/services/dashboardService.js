import axios from "axios";

const API_URL =
  "http://localhost:5000/api/dashboard";

export const getDashboardSummary =
  async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/summary`
        );

      console.log(
        "Dashboard API Raw Response:",
        response.data
      );

      return response.data;

    } catch (error) {

      console.error(
        "Dashboard Service Error:",
        error
      );

      throw error;

    }

  };


export const getRecentAlerts =
  async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/alerts`
        );

      return response.data;

    } catch (error) {

      console.error(
        "Alert Service Error:",
        error
      );

      throw error;

    }

  };