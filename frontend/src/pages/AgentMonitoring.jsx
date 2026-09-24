import React, { useEffect, useState } from "react";

const AGENTS = [
  "ingestion_agent",
  "data_quality_agent",
  "feature_engineering_agent",
  "prediction_agent",
  "analysis_agent",
  "recommendation_agent",
  "alert_agent",
  "report_agent",
  "notification_agent",
  "health_monitor_agent",
  "cleanup_agent",
];

function AgentMonitoring() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/agents/health"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setAgents(data.agents || []);
    } catch (err) {
      setError("Unable to load agent health data.");
      console.error("Agent monitoring error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatus = (agentName) => {
    const record = agents.find(
      (agent) => agent.agent_name === agentName
    );

    return record || {
      agent_name: agentName,
      status: "unknown",
      failure_count: 0,
      last_error: null,
    };
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1>Agent Monitoring</h1>
          <p>
            TECHNOVA Sentinel AI autonomous agent health and execution status.
          </p>
        </div>

        <button onClick={fetchHealth}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading agent status...</p>}

      {error && (
        <p>
          {error}
        </p>
      )}

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {AGENTS.map((agentName) => {
            const agent = getStatus(agentName);

            return (
              <div
                key={agentName}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "18px",
                  background: "#fff",
                }}
              >
                <h3>{agent.agent_name}</h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {agent.status || "unknown"}
                </p>

                <p>
                  <strong>Failures:</strong>{" "}
                  {agent.failure_count || 0}
                </p>

                <p>
                  <strong>Last Run:</strong>{" "}
                  {agent.last_run_at || "Not executed"}
                </p>

                <p>
                  <strong>Last Success:</strong>{" "}
                  {agent.last_success_at || "Not available"}
                </p>

                {agent.last_error && (
                  <p>
                    <strong>Error:</strong>{" "}
                    {agent.last_error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AgentMonitoring;
