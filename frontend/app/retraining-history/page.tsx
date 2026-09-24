"use client";

import { useEffect, useState } from "react";

type History = {
  id: number;
  trigger_type: string;
  trigger_details: {
    triggers?: string[];
    new_records?: number;
    max_psi?: number;
    psi_threshold?: number;
    record_threshold?: number;
  };
  model_name: string;
  candidate_version: string;
  dataset_hash: string;
  training_records: number;
  metrics: {
    f1_score?: number;
    roc_auc?: number;
  };
  status: string;
  promotion_status: string;
  notes?: string;
  created_at: string;
};

export default function RetrainingHistoryPage() {
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:8000";

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/v1/retraining/history`
      );

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch {
      setError("Backend API is not reachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const promoted = history.filter(
    (item) => item.promotion_status === "promoted"
  ).length;

  const rejected = history.filter(
    (item) => item.promotion_status === "rejected"
  ).length;

  const automatic = history.filter(
    (item) => item.trigger_type === "AUTO"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            TECHNOVA SENTINEL AI
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Retraining History
          </h1>

          <p className="mt-2 text-slate-400">
            Automated model retraining and promotion audit trail
          </p>
        </div>

        <nav className="mb-10 flex gap-3">
          <a
            href="/"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Model Registry
          </a>

          <a
            href="/retraining-history"
            className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            Retraining History
          </a>
        </nav>

        <div className="mb-8 grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Runs</p>
            <p className="mt-2 text-3xl font-bold">
              {history.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Automatic</p>
            <p className="mt-2 text-3xl font-bold">
              {automatic}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Promoted</p>
            <p className="mt-2 text-3xl font-bold">
              {promoted}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Rejected</p>
            <p className="mt-2 text-3xl font-bold">
              {rejected}
            </p>
          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>
              <h2 className="text-xl font-semibold">
                Retraining Runs
              </h2>

              <p className="text-sm text-slate-400">
                Trigger, model, metrics and promotion history
              </p>
            </div>

            <button
              onClick={loadHistory}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Refresh
            </button>

          </div>

          {loading && (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading retraining history...
            </div>
          )}

          {error && (
            <div className="px-6 py-12 text-center">
              <p className="text-red-400">{error}</p>

              <button
                onClick={loadHistory}
                className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No retraining history available.
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Run</th>
                    <th className="px-6 py-4">Trigger</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">F1</th>
                    <th className="px-6 py-4">ROC-AUC</th>
                    <th className="px-6 py-4">Records</th>
                    <th className="px-6 py-4">Promotion</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50"
                    >

                      <td className="px-6 py-5 font-semibold">
                        #{item.id}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400">
                          {item.trigger_type}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-mono text-cyan-400">
                        {item.candidate_version}
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {(item.metrics?.f1_score || 0).toFixed(3)}
                      </td>

                      <td className="px-6 py-5">
                        {(item.metrics?.roc_auc || 0).toFixed(3)}
                      </td>

                      <td className="px-6 py-5">
                        {item.training_records}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.promotion_status === "promoted"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : item.promotion_status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {item.promotion_status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}