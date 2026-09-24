import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getDashboardSummary,
  getDashboardRiskTrend,
} from "../services/dashboardService";  

import SummaryCounter from "../components/dashboard/SummaryCounter";
import TopRiskDistricts from "../components/dashboard/TopRiskDistricts";
import PredictionCard from "../components/dashboard/PredictionCard";
import LiveWeatherPanel from "../components/dashboard/LiveWeatherPanel";
import RiskTrendChart from "../components/dashboard/RiskTrendChart";

import useDashboardStore from "../store/dashboardStore";
import useDashboardWebSocket from "../hooks/useDashboardWebSocket";
import TamilNaduRiskMap from "../components/dashboard/TamilNaduRiskMap";

import "../styles/dashboard.css";

const DEFAULT_DISTRICT_COUNT = 38;

const RISK_PRIORITY = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NO_DATA: 0,
};

const EMPTY_RISK_COUNTS = {
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0,
  CRITICAL: 0,
};

export default function Dashboard({ onDistrictSelect }) {
  // ==========================================
  // WEBSOCKET
  // ==========================================

  useDashboardWebSocket();

  // ==========================================
  // ZUSTAND
  // ==========================================

  const wsConnected = useDashboardStore(
    (state) => state.connected
  );

  const wsStatus = useDashboardStore(
    (state) => state.status
  );

  const wsTotalDistricts = useDashboardStore(
    (state) => state.totalDistricts
  );

  const wsTotalPredictions = useDashboardStore(
    (state) => state.totalPredictions
  );

  const wsRiskCounts = useDashboardStore(
    (state) => state.riskCounts
  );

  const wsDistrictData = useDashboardStore(
    (state) => state.districtData
  );

  const wsTopRiskDistricts = useDashboardStore(
    (state) => state.topRiskDistricts
  );

  const wsLatestPredictions = useDashboardStore(
    (state) => state.latestPredictions
  );

  const wsLastUpdated = useDashboardStore(
    (state) => state.lastUpdated
  );

  // ==========================================
  // REST STATE
  // ==========================================

  const [summary, setSummary] = useState({
    totalDistricts: DEFAULT_DISTRICT_COUNT,
    totalPredictions: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    criticalRiskCount: 0,
    lastUpdated: null,
  });

  const [allDistricts, setAllDistricts] = useState([]);

  const [topRiskDistricts, setTopRiskDistricts] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  const [riskTrend, setRiskTrend] = useState([]);

  // ==========================================
  // ALERT STATISTICS
  // ==========================================

  const [alertStats, setAlertStats] = useState({
    total: 0,
    new: 0,
    acknowledged: 0,
    resolved: 0,
  });

  // ==========================================
  // LOAD ALERT STATISTICS
  // ==========================================

  const loadAlertStatistics = () => {
    try {
      const storedAlerts =
        localStorage.getItem(
          "technova_alert_history"
        );

      const alerts = storedAlerts
        ? JSON.parse(storedAlerts)
        : [];

      const safeAlerts =
        Array.isArray(alerts)
          ? alerts
          : [];

      setAlertStats({
        total: safeAlerts.length,

        new: safeAlerts.filter(
          (item) =>
            item?.status === "NEW"
        ).length,

        acknowledged:
          safeAlerts.filter(
            (item) =>
              item?.status ===
              "ACKNOWLEDGED"
          ).length,

        resolved:
          safeAlerts.filter(
            (item) =>
              item?.status ===
              "RESOLVED"
          ).length,
      });
    } catch (err) {
      console.error(
        "Alert statistics error:",
        err
      );
    }
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
  try {
    setError(null);

    // ========================================
    // LOAD HISTORICAL RISK TREND
    // ========================================

    try {
      const trendResponse =
        await getDashboardRiskTrend(12);

      if (trendResponse?.success) {
        setRiskTrend(
          Array.isArray(trendResponse?.data)
            ? trendResponse.data
            : []
        );
      }
    } catch (trendError) {
      console.error(
        "Dashboard Risk Trend Error:",
        trendError
      );

      // Trend failure should NOT break dashboard
      setRiskTrend([]);
    }

    // ========================================
    // LOAD REST SUMMARY AS FALLBACK
    // ========================================

    try {
      const response =
        await getDashboardSummary();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to load dashboard summary"
        );
      }

      const districts =
        Array.isArray(
          response?.all_districts
        )
          ? response.all_districts
          : [];

      const highRisk =
        Number(
          response?.high_risk
        ) || 0;

      const mediumRisk =
        Number(
          response?.medium_risk
        ) || 0;

      const lowRisk =
        Number(
          response?.low_risk
        ) || 0;

      const criticalRisk =
        Number(
          response?.critical_risk
        ) || 0;

      setSummary({
        totalDistricts:
          Number(
            response?.total_districts
          ) ||
          DEFAULT_DISTRICT_COUNT,

        totalPredictions:
          Number(
            response?.total_predictions
          ) || districts.length,

        highRiskCount:
          highRisk,

        mediumRiskCount:
          mediumRisk,

        lowRiskCount:
          lowRisk,

        criticalRiskCount:
          criticalRisk,

        lastUpdated:
          response?.last_updated ||
          new Date().toISOString(),
      });

      setAllDistricts(
        districts
      );

      // ========================================
      // SORT TOP RISK
      // ========================================

      const sorted =
        [...districts]
          .sort((a, b) => {
            const riskA =
              RISK_PRIORITY[
                String(
                  a?.risk_level ||
                    "NO_DATA"
                ).toUpperCase()
              ] || 0;

            const riskB =
              RISK_PRIORITY[
                String(
                  b?.risk_level ||
                    "NO_DATA"
                ).toUpperCase()
              ] || 0;

            if (riskA !== riskB) {
              return riskB - riskA;
            }

            const probabilityA =
              Number(
                a?.surge_probability ??
                  a?.probability ??
                  0
              );

            const probabilityB =
              Number(
                b?.surge_probability ??
                  b?.probability ??
                  0
              );

            return (
              probabilityB -
              probabilityA
            );
          })
          .filter(
            (item) =>
              String(
                item?.risk_level ||
                  "NO_DATA"
              ).toUpperCase() !==
              "NO_DATA"
          )
          .slice(0, 10);

      setTopRiskDistricts(
        sorted
      );

    } catch (summaryError) {
      console.error(
        "Dashboard Summary API Error:",
        summaryError
      );

      // IMPORTANT:
      // WebSocket is the primary live source.
      // Do NOT show the full Dashboard Error
      // when REST summary fails.
    }

  } catch (err) {
    console.error(
      "Dashboard loading error:",
      err
    );

    // Only unexpected errors reach here.
    // REST API failures are handled above.
  } finally {
    setLoading(false);
  }
};
    
  // ==========================================
  // REFRESH
  // ==========================================

  const refreshDashboard = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadDashboard(),
        Promise.resolve(
          loadAlertStatistics()
        ),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    refreshDashboard();

    const interval =
      setInterval(
        refreshDashboard,
        30000
      );

    const handleFocus = () => {
      loadDashboard();
      loadAlertStatistics();
    };

    const handleAlertUpdate = () => {
      loadAlertStatistics();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    window.addEventListener(
      "technova-alert-updated",
      handleAlertUpdate
    );

    window.addEventListener(
      "storage",
      handleAlertUpdate
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "technova-alert-updated",
        handleAlertUpdate
      );

      window.removeEventListener(
        "storage",
        handleAlertUpdate
      );
    };
  }, []);

  // ==========================================
  // SAFE WEBSOCKET DATA
  // ==========================================

  const safeRiskCounts = {
    ...EMPTY_RISK_COUNTS,
    ...(wsRiskCounts || {}),
  };

  const safeDistrictData =
    Array.isArray(wsDistrictData)
      ? wsDistrictData
      : [];

  const safeTopRisk =
    Array.isArray(
      wsTopRiskDistricts
    )
      ? wsTopRiskDistricts
      : [];

  const safeLatest =
    Array.isArray(
      wsLatestPredictions
    )
      ? wsLatestPredictions
      : [];

  // ==========================================
  // DISPLAY VALUES
  // ==========================================

  /*
   * WebSocket is the primary live source.
   * REST is used as fallback when WebSocket
   * is disconnected or does not have data.
   */

  const displayTotalDistricts =
    wsConnected &&
    Number.isFinite(
      wsTotalDistricts
    )
      ? wsTotalDistricts
      : summary.totalDistricts;

  const displayTotalPredictions =
    wsConnected &&
    Number.isFinite(
      wsTotalPredictions
    )
      ? wsTotalPredictions
      : summary.totalPredictions;

  const displayRiskCounts =
    wsConnected
      ? safeRiskCounts
      : {
          HIGH: summary.highRiskCount,
          MEDIUM: summary.mediumRiskCount,
          LOW: summary.lowRiskCount,
          CRITICAL:
            summary.criticalRiskCount,
        };

  const displayAllDistricts =
    wsConnected &&
    safeDistrictData.length > 0
      ? safeDistrictData
      : allDistricts;

  const displayTopRiskDistricts =
    wsConnected &&
    safeTopRisk.length > 0
      ? safeTopRisk
      : topRiskDistricts;

  // ==========================================
  // PREDICTION CARDS
  // ==========================================

  const predictionCards =
    useMemo(() => {
      if (
        wsConnected &&
        safeLatest.length > 0
      ) {
        return safeLatest;
      }

      if (
        displayTopRiskDistricts.length >
        0
      ) {
        return displayTopRiskDistricts;
      }

      return [];
    }, [
      wsConnected,
      safeLatest,
      displayTopRiskDistricts,
    ]);

  // ==========================================
  // LAST UPDATED
  // ==========================================

  const displayLastUpdated =
    wsConnected &&
    wsLastUpdated
      ? wsLastUpdated
      : summary.lastUpdated;

  // ==========================================
  // RISK CLASS
  // ==========================================

  const getRiskClass = (
    riskLevel
  ) => {
    switch (
      String(
        riskLevel || ""
      ).toUpperCase()
    ) {
      case "CRITICAL":
        return "risk-critical";

      case "HIGH":
        return "risk-high";

      case "MEDIUM":
        return "risk-medium";

      case "LOW":
        return "risk-low";

      default:
        return "risk-no-data";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
        <h2 className="text-xl font-semibold text-red-400">
          Dashboard Error
        </h2>

        <p className="mt-2 text-slate-400">
          {error}
        </p>

        <button
          onClick={
            refreshDashboard
          }
          disabled={refreshing}
          className="mt-5 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {refreshing
            ? "Retrying..."
            : "Try Again"}
        </button>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              Seasonal Disease Surge Prediction
            </h1>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                wsConnected
                  ? "border-green-800 bg-green-950/40 text-green-400"
                  : "border-yellow-800 bg-yellow-950/40 text-yellow-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  wsConnected
                    ? "animate-pulse bg-green-500"
                    : "bg-yellow-500"
                }`}
              />

              {wsConnected
                ? "LIVE"
                : "OFFLINE"}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Tamil Nadu Disease Surveillance
            Command Center
          </p>
        </div>

        <button
          onClick={
            refreshDashboard
          }
          disabled={refreshing}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh Dashboard"}
        </button>
      </motion.div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCounter
          title="Total Districts"
          value={
            displayTotalDistricts
          }
          subtitle="Tamil Nadu"
          icon="🗺️"
          type="districts"
        />

        <SummaryCounter
          title="Total Predictions"
          value={
            displayTotalPredictions
          }
          subtitle="Active predictions"
          icon="📊"
          type="default"
        />

        <SummaryCounter
          title="High Risk"
          value={
            displayRiskCounts.HIGH ||
            0
          }
          subtitle="Immediate attention"
          icon="🔴"
          type="high"
        />

        <SummaryCounter
          title="Medium Risk"
          value={
            displayRiskCounts.MEDIUM ||
            0
          }
          subtitle="Monitor closely"
          icon="🟡"
          type="medium"
        />

        <SummaryCounter
          title="Low Risk"
          value={
            displayRiskCounts.LOW ||
            0
          }
          subtitle="Normal surveillance"
          icon="🟢"
          type="low"
        />

      </div>

      {/* ALERT MANAGEMENT */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Alert Management
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Operational Alert Status
            </h2>
          </div>

          <span className="text-xs text-slate-500">
            Local alert history
          </span>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-xl bg-slate-800/60 p-4">
            <p className="text-xs text-slate-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {alertStats.total}
            </p>
          </div>

          <div className="rounded-xl bg-red-950/30 p-4">
            <p className="text-xs text-red-400">
              New
            </p>

            <p className="mt-1 text-2xl font-bold text-red-300">
              {alertStats.new}
            </p>
          </div>

          <div className="rounded-xl bg-yellow-950/30 p-4">
            <p className="text-xs text-yellow-400">
              Acknowledged
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-300">
              {alertStats.acknowledged}
            </p>
          </div>

          <div className="rounded-xl bg-green-950/30 p-4">
            <p className="text-xs text-green-400">
              Resolved
            </p>

            <p className="mt-1 text-2xl font-bold text-green-300">
              {alertStats.resolved}
            </p>
          </div>

        </div>
      </div>

      {/* TOP RISK + PREDICTIONS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <TopRiskDistricts
          districts={
            displayTopRiskDistricts
          }
          limit={10}
          onDistrictSelect={
            onDistrictSelect
          }
        />

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Live Predictions
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Latest Disease Risk
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              {predictionCards.length} records
            </span>

          </div>

          {predictionCards.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <p className="text-sm text-slate-500">
                No prediction data available
              </p>
            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {predictionCards
                .slice(0, 5)
                .map(
                  (
                    prediction,
                    index
                  ) => (
                    <PredictionCard
                      key={`${prediction?.district || "unknown"}-${prediction?.disease || "unknown"}-${index}`}
                      district={
                        prediction?.district
                      }
                      disease={
                        prediction?.disease
                      }
                      riskLevel={
                        prediction?.risk_level
                      }
                      probability={
                        prediction?.probability ??
                        prediction?.surge_probability
                      }
                      cases={
                        prediction?.cases ??
                        prediction?.expected_cases_2w ??
                        prediction?.predicted_cases
                      }
                      updatedAt={
                        prediction?.updated_at ??
                        prediction?.generated_at ??
                        (
                          prediction?.year &&
                          prediction?.week_number
                        )
                          ? `${prediction.year}-W${String(
                              prediction.week_number
                            ).padStart(
                              2,
                              "0"
                            )}`
                          : null
                      }
                    />
                  )
                )}

            </div>

          )}

        </div>

      </div>

      {/* DISTRICT MAP / STATUS */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Tamil Nadu Surveillance
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              District Risk Overview
            </h2>
          </div>

          <span className="text-xs text-slate-500">
            {displayAllDistricts.length} districts
          </span>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">

          {displayAllDistricts.map(
            (district, index) => {

              const risk =
                String(
                  district?.risk_level ||
                    "NO_DATA"
                ).toUpperCase();

              const probability =
                Number(
                  district?.probability ??
                    district?.surge_probability ??
                    0
                );

              const percentage =
                probability <= 1
                  ? probability * 100
                  : probability;

              return (
                <div
                  key={`${district?.district || "district"}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >

                  <p className="truncate text-xs font-semibold text-white">
                    {district?.district ||
                      "Unknown"}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${getRiskClass(
                      risk
                    )}`}
                  >
                    {risk}
                  </span>

                  <p className="mt-2 text-xs text-slate-500">
                    {Number.isFinite(
                      percentage
                    )
                      ? `${percentage.toFixed(
                          0
                        )}% probability`
                      : "0% probability"}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>
      <TamilNaduRiskMap
  districts={
    wsConnected &&
    safeDistrictData.length > 0
      ? safeDistrictData
      : displayAllDistricts
  }
  onDistrictSelect={onDistrictSelect}
/>

      {/* WEATHER + TREND */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <LiveWeatherPanel
          weather={null}
          district="Tamil Nadu"
          loading={false}
        />

     <RiskTrendChart
  data={riskTrend}
  title="Risk Trend"
  subtitle="Historical disease outbreak risk over the last 12 weeks"
/>

      </div>

      {/* DISTRICT TABLE */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              District Monitoring
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              All 38 Districts
            </h2>
          </div>

          <span className="text-xs text-slate-500">
            Live WebSocket dataset
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">

                <th className="px-4 py-3">
                  District
                </th>

                <th className="px-4 py-3">
                  Disease
                </th>

                <th className="px-4 py-3">
                  Risk
                </th>

                <th className="px-4 py-3">
                  Probability
                </th>

                <th className="px-4 py-3">
                  Expected Cases
                </th>

              </tr>

            </thead>

            <tbody>

              {displayAllDistricts.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No district data available
                  </td>

                </tr>

              ) : (

                displayAllDistricts.map(
                  (district, index) => {

                    const probability =
                      Number(
                        district?.probability ??
                          district?.surge_probability ??
                          0
                      );

                    const percentage =
                      probability <= 1
                        ? probability * 100
                        : probability;

                    return (
                      <tr
                        key={`${district?.district || "unknown"}-${index}`}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                      >

                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {district?.district ||
                            "Unknown"}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-400">
                          {district?.disease ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskClass(
                              district?.risk_level
                            )}`}
                          >
                            {district?.risk_level ||
                              "NO_DATA"}
                          </span>

                        </td>

                        <td className="px-4 py-3 text-sm text-slate-300">

                          {Number.isFinite(
                            percentage
                          )
                            ? `${percentage.toFixed(
                                0
                              )}%`
                            : "0%"}

                        </td>

                        <td className="px-4 py-3 text-sm text-slate-300">

                          {district?.expected_cases_2w ??
                            district?.predicted_cases ??
                            district?.cases ??
                            "—"}

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* FOOTER */}

      <div className="flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">

        <div>
          Last updated:{" "}
          {displayLastUpdated
            ? new Date(
                displayLastUpdated
              ).toLocaleString()
            : "Waiting for data"}
        </div>

        <div className="flex flex-wrap items-center gap-4">

          <span>
            Data Source: TECHNOVA Sentinel AI
          </span>

          <span
            className={
              wsConnected
                ? "text-green-400"
                : "text-yellow-400"
            }
          >
            WebSocket:{" "}
            {wsConnected
              ? "Connected"
              : "Disconnected"}
          </span>

          <span>
            Status:{" "}
            {wsStatus || "unknown"}
          </span>

        </div>

      </div>

    </div>
  );
}