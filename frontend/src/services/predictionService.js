import API from "./api";

const predictionService = {

  // Get all latest predictions
  async getPredictions() {
    const response = await API.get(
      "/api/v1/predictions"
    );

    return response.data?.data || [];
  },

  // Get predictions for one disease
  async getDiseasePrediction(disease) {
    const response = await API.get(
      "/api/v1/predictions",
      {
        params: {
          disease,
        },
      }
    );

    return response.data?.data || [];
  },

  // Get high-risk predictions
  async getHighRiskPredictions() {
    const response = await API.get(
      "/api/v1/predictions"
    );

    const predictions =
      response.data?.data || [];

    return predictions.filter(
      (prediction) =>
        String(
          prediction?.risk_level || ""
        ).toUpperCase() === "HIGH"
    );
  },

};

export default predictionService;