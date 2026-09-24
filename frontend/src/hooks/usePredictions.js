import { useState, useEffect } from "react";
import predictionService from "../services/predictionService";

export default function usePredictions(
  disease = null
) {
  const [predictions, setPredictions] =
    useState([]);

  const [highRiskPredictions,
    setHighRiskPredictions] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchPredictions =
    async () => {
      try {
        setLoading(true);

        let data = [];

        if (disease) {
          data =
            await predictionService.getDiseasePrediction(
              disease
            );
        } else {
          data =
            await predictionService.getPredictions();
        }

        const highRisk =
          await predictionService.getHighRiskPredictions();

        setPredictions(data);
        setHighRiskPredictions(highRisk);

        setError("");
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load prediction data"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPredictions();
  }, [disease]);

  return {
    predictions,
    highRiskPredictions,
    loading,
    error,
    refreshPredictions:
      fetchPredictions,
  };
}
