import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api/v1";

function ReportsCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const loadReports = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/reports`
      );

      const data = await response.json();

      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async (format) => {
    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/reports/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_type: "on_demand",
            output_format: format,
            prediction_summary: {
              disease: "Dengue",
              district: "Tamil Nadu",
              risk_level: "HIGH",
            },
            weather_trends: [],
            hospital_resources: [],
            recommendations: [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Report generation failed"
        );
      }

      setMessage(
        `${format.toUpperCase()} report generated successfully.`
      );

      await loadReports();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (reportId) => {
    window.open(
      `${API_BASE}/reports/${reportId}/download`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Reports Center
        </h1>

        <p
          style={{
            opacity: 0.7,
          }}
        >
          Generate and download TECHNOVA Sentinel AI health reports.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#eef6ff",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {["pdf", "excel", "csv", "json"].map(
          (format) => (
            <button
              key={format}
              onClick={() =>
                generateReport(format)
              }
              disabled={generating}
              style={{
                padding: "16px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                cursor: generating
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                background: "#fff",
              }}
            >
              {generating
                ? "Generating..."
                : `Generate ${format.toUpperCase()}`}
            </button>
          )
        )}
      </div>

      <div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          Generated Reports
        </h2>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports generated yet.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <strong>
                    {report.filename}
                  </strong>

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "13px",
                      opacity: 0.7,
                    }}
                  >
                    {report.format.toUpperCase()} ·{" "}
                    {report.report_type} ·{" "}
                    {report.status}
                  </div>
                </div>

                <button
                  onClick={() =>
                    downloadReport(report.id)
                  }
                  style={{
                    padding:
                      "9px 14px",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsCenter;
