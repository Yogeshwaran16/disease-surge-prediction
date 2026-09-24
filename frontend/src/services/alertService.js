import axios from "axios";


const API_BASE_URL =
  "http://127.0.0.1:8000/api/v1/alerts";


export const getAlerts =
  async () => {

    const response =
      await axios.get(
        `${API_BASE_URL}/`
      );

    return response.data;

  };


export const getAlertsByDistrict =
  async (district) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/district/${district}`
      );

    return response.data;

  };


export const getAlertsByRisk =
  async (riskLevel) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/risk/${riskLevel}`
      );

    return response.data;

  };


export const checkAlertService =
  async () => {

    const response =
      await axios.get(
        `${API_BASE_URL}/health`
      );

    return response.data;

  };
