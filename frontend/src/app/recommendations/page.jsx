"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function RecommendationsPage() {
  const [predictionId, setPredictionId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendation = async () => {
    if (!predictionId.trim()) {
      setError("Please enter a Prediction ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/v1/predictions/${predictionId}/recommendations`
      );

      if (!response.ok) {
        throw new Error("Recommendation not found");
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🩺 Disease Recommendations</h1>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter Prediction ID"
          value={predictionId}
          onChange={(e) => setPredictionId(e.target.value)}
          style={{
            padding: "12px",
            width: "300px",
            marginRight: "10px",
          }}
        />

        <button
          onClick={getRecommendation}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Recommendation"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: "20px", color: "red" }}>
          {error}
        </p>
      )}

      {data && (
        <section style={{ marginTop: "40px" }}>
          <h2>Prediction Details</h2>

          <p>
            <strong>Prediction ID:</strong>{" "}
            {data.prediction_id}
          </p>

          <p>
            <strong>District:</strong>{" "}
            {data.district}
          </p>

          <p>
            <strong>Disease:</strong>{" "}
            {data.disease}
          </p>

          <p>
            <strong>Risk Level:</strong>{" "}
            {data.risk_level}
          </p>

          <p>
            <strong>Outbreak Probability:</strong>{" "}
            {(data.outbreak_probability * 100).toFixed(2)}%
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {(data.confidence * 100).toFixed(2)}%
          </p>

          <h2>🚨 Emergency Status</h2>

          <p>
            {data.emergency_escalated
              ? "🚨 EMERGENCY RESPONSE ACTIVE"
              : "✅ Normal Response"}
          </p>

          <h2>📋 Recommendations</h2>

          {data.recommendations?.recommendations?.map(
            (item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <h3>
                  #{item.rank} — {item.action}
                </h3>

                <p>
                  <strong>Category:</strong>{" "}
                  {item.category}
                </p>

                <p>
                  <strong>Priority Score:</strong>{" "}
                  {item.priority_score}
                </p>

                {item.description && (
                  <p>{item.description}</p>
                )}
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}
