import React, { useEffect, useState } from "react";
import {
  FaDatabase,
  FaCloudRain,
  FaHospital,
  FaTemperatureHigh,
  FaAmbulance,
  FaPills,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const API_URL =
  "http://127.0.0.1:8000/api/v1/data-sources/citations";

const ICONS = {
  Rainfall: <FaCloudRain />,
  "OPD Counts": <FaHospital />,
  Temperature: <FaTemperatureHigh />,
  "Ambulance Calls": <FaAmbulance />,
  "Medicine Demand": <FaPills />,
};

const DataSourcePanel = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSources = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Data source request failed: ${response.status}`
          );
        }

        const result = await response.json();

        setSources(
          Array.isArray(result?.sources)
            ? result.sources
            : []
        );
      } catch (err) {
        console.error(
          "Data Source Load Error:",
          err
        );
        setError(
          "Unable to load data source metadata."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSources();
  }, []);

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  const formatValue = (item) => {
  if (!item) {
    return "Not available";
  }

  const value = Number(item.value);

  if (Number.isNaN(value)) {
    return "Not available";
  }

  return `${value.toLocaleString()} ${item.unit || ""}`.trim();
};

  const getFreshnessStatus = (source) => {
    if (source.status === "MISSING") {
      return {
        label: "Missing",
        className:
          "text-red-400 bg-red-500/10 border-red-500/30",
        icon: <FaExclamationTriangle />,
      };
    }

    if (!source.last_updated) {
      return {
        label: "Freshness unavailable",
        className:
          "text-orange-400 bg-orange-500/10 border-orange-500/30",
        icon: <FaExclamationTriangle />,
      };
    }

    return {
      label: "Source available",
      className:
        "text-green-400 bg-green-500/10 border-green-500/30",
      icon: <FaCheckCircle />,
    };
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <FaDatabase className="text-cyan-400" />
          <h2 className="text-xl font-bold text-white">
            Data Source Citation Panel
          </h2>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Loading data source metadata...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg">

      {/* HEADER */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <FaDatabase
            size={24}
            className="text-cyan-400"
          />

          <div>
            <h2 className="text-xl font-bold text-white">
              Data Source Citation Panel
            </h2>

            <p className="text-sm text-slate-400">
              Provenance and freshness of prediction data
            </p>
          </div>
        </div>

        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
          {sources.length} SOURCES
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* SOURCE CARDS */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sources.map((source) => {
          const freshness =
            getFreshnessStatus(source);

          return (
            <div
              key={source.data_category}
              className="rounded-xl border border-slate-700 bg-slate-800 p-5"
            >
              {/* TITLE */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl text-cyan-400">
                    {ICONS[source.data_category] || (
                      <FaDatabase />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      {source.data_category}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {source.provider}
                    </p>
                  </div>

                </div>

                <span
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${freshness.className}`}
                >
                  {freshness.icon}
                  {freshness.label}
                </span>

              </div>

              {/* METADATA */}
              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-slate-900 p-3">
                  <p className="text-xs text-slate-500">
                    Source Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {source.source_type || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-900 p-3">
                  <p className="text-xs text-slate-500">
                    Ingestion Cadence
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {source.ingestion_cadence || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-900 p-3">
                  <p className="text-xs text-slate-500">
                    Historical Data
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-400">
                    {source.historical_available
                      ? "Available"
                      : "Unavailable"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-900 p-3">
                  <p className="text-xs text-slate-500">
                    Current Data
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-400">
                    {source.current_available
                      ? "Available"
                      : "Unavailable"}
                  </p>
                </div>

<div className="rounded-lg bg-slate-900 p-3">
  <p className="text-xs text-slate-500">
    Historical Value
  </p>

  <p className="mt-1 text-sm font-semibold text-cyan-400">
    {formatValue(source.historical_value)}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {source.historical_value?.date || "Date unavailable"}
  </p>
</div>

<div className="rounded-lg bg-slate-900 p-3">
  <p className="text-xs text-slate-500">
    Current Value
  </p>

  <p className="mt-1 text-sm font-semibold text-green-400">
    {formatValue(source.current_value)}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {source.current_value?.date || "Date unavailable"}
  </p>
</div>

              </div>

              {/* FILE */}
              <div className="mt-4">
                <p className="text-xs text-slate-500">
                  Dataset
                </p>

                <p className="mt-1 break-all text-xs text-cyan-300">
                  {source.filename || "—"}
                </p>
              </div>

              {/* LAST UPDATED */}
              <div className="mt-4 flex flex-col gap-1 border-t border-slate-700 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatDate(
                      source.last_updated
                    )}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">
                    Ingestion Record
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-300">
                    {source.ingestion_record_id ||
                      "Not linked"}
                  </p>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* HISTORICAL / CURRENT NOTE */}
      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">
            Data provenance:
          </span>{" "}
          Citation metadata is derived from the project
          datasets and their current filesystem metadata.
          Historical and current availability are shown
          for each prediction data category.
        </p>
      </div>

    </div>
  );
};

export default DataSourcePanel;