import React, { useEffect, useState } from "react";
import {
  FaMapMarkedAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const TamilNaduOutbreakMap = ({
  districtsData = [],
  onDistrictSelect,
}) => {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] =
    useState(null);

  useEffect(() => {
    if (Array.isArray(districtsData)) {
      const mappedData = districtsData.map((item) => ({
        district: item.district,
        risk_score:
          Math.round(
            (item.surge_probability || 0) * 100
          ),
        risk_level: item.risk_level,
        disease: item.disease,
        expected_cases:
          item.expected_cases_2w,
      }));

      const sortedData = [...mappedData].sort(
        (a, b) => b.risk_score - a.risk_score
      );

      setDistricts(sortedData);

      if (sortedData.length > 0) {
        setSelectedDistrict(sortedData[0]);

        onDistrictSelect?.(
          sortedData[0].district
        );
      }
    }
  }, [districtsData, onDistrictSelect]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return "#ef4444";

      case "MEDIUM":
        return "#f59e0b";

      case "LOW":
        return "#22c55e";

      default:
        return "#94a3b8";
    }
  };

  const getRiskBackground = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return "#fee2e2";

      case "MEDIUM":
        return "#fef3c7";

      case "LOW":
        return "#dcfce7";

      default:
        return "#e2e8f0";
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    onDistrictSelect?.(district.district);
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <FaMapMarkedAlt
          size={24}
          color="#2563eb"
        />
        <h2 style={{ margin: 0 }}>
          Tamil Nadu Disease Risk Dashboard
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <span>🟢 Low Risk</span>
        <span>🟡 Medium Risk</span>
        <span>🔴 High Risk</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(180px,1fr))",
          gap: "15px",
        }}
      >
        {districts.map((district) => (
          <div
            key={district.district}
            onClick={() =>
              handleDistrictClick(district)
            }
            style={{
              cursor: "pointer",
              padding: "15px",
              borderRadius: "14px",
              background:
                getRiskBackground(
                  district.risk_level
                ),
              border:
                selectedDistrict?.district ===
                district.district
                  ? `3px solid ${getRiskColor(
                      district.risk_level
                    )}`
                  : "1px solid #e5e7eb",
            }}
          >
            <h4>{district.district}</h4>

            <div
              style={{
                color: getRiskColor(
                  district.risk_level
                ),
                fontWeight: "bold",
              }}
            >
              {district.risk_level}
            </div>

            <div>
              Risk Score
              <h3>
                {district.risk_score}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {selectedDistrict && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <FaExclamationTriangle
              color={getRiskColor(
                selectedDistrict.risk_level
              )}
            />

            <h3>
              {selectedDistrict.district}
            </h3>
          </div>

          <p>
            <strong>Risk Level:</strong>{" "}
            {selectedDistrict.risk_level}
          </p>

          <p>
            <strong>Disease:</strong>{" "}
            {selectedDistrict.disease}
          </p>

          <p>
            <strong>Expected Cases:</strong>{" "}
            {selectedDistrict.expected_cases}
          </p>
        </div>
      )}
    </div>
  );
};

export default TamilNaduOutbreakMap;
