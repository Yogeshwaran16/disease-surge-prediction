"use client";

import { useEffect, useState } from "react";

type Model = {
  model_name: string;
  version: string;
  algorithm: string;
  status: string;
  metrics: {
    precision?: number;
    recall?: number;
    f1_score?: number;
    roc_auc?: number;
    brier_score?: number;
  };
  training_records: number;
  dataset_hash: string;
  model_path?: string;
  created_at: string;
};

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:8000";

  async function loadModels() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/api/v1/models`);

      if (!response.ok) {
        throw new Error("Failed to load models");
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      setError("Backend API is not reachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            TECHNOVA SENTINEL AI
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Model Registry
          </h1>

          <p className="mt-2 text-slate-400">
            Champion and challenger model management
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Models</p>
            <p className="mt-2 text-3xl font-bold">{models.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Champion</p>
            <p className="mt-2 text-3xl font-bold">
              {models.filter((m) => m.status === "champion").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Challengers</p>
            <p className="mt-2 text-3xl font-bold">
              {models.filter(
                (m) =>
                  m.status === "challenger" ||
                  m.status === "candidate"
              ).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Best F1</p>
            <p className="mt-2 text-3xl font-bold">
              {models.length
                ? Math.max(
                    ...models.map((m) => m.metrics?.f1_score || 0)
                  ).toFixed(3)
                : "—"}
            </p>
          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">
                Registered Models
              </h2>
              <p className="text-sm text-slate-400">
                Model versions and evaluation metrics
              </p>
            </div>

            <button
              onClick={loadModels}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="px-6 py-10 text-center text-slate-400">
              Loading models...
            </div>
          )}

          {error && (
            <div className="px-6 py-10 text-center text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && models.length === 0 && (
            <div className="px-6 py-10 text-center text-slate-400">
              No models registered yet.
            </div>
          )}

          {!loading && !error && models.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Model</th>
                    <th className="px-6 py-4">Version</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">F1</th>
                    <th className="px-6 py-4">ROC-AUC</th>
                    <th className="px-6 py-4">Records</th>
                    <th className="px-6 py-4">Dataset Hash</th>
                  </tr>
                </thead>

                <tbody>
                  {models.map((model) => (
                    <tr
                      key={model.version}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-5 font-medium">
                        {model.model_name}
                      </td>

                      <td className="px-6 py-5 font-mono text-cyan-400">
                        {model.version}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            model.status === "champion"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : model.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : model.status === "archived"
                              ? "bg-slate-700 text-slate-300"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {model.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {(model.metrics?.f1_score || 0).toFixed(3)}
                      </td>

                      <td className="px-6 py-5">
                        {(model.metrics?.roc_auc || 0).toFixed(3)}
                      </td>

                      <td className="px-6 py-5">
                        {model.training_records}
                      </td>

                      <td className="max-w-xs truncate px-6 py-5 font-mono text-xs text-slate-400">
                        {model.dataset_hash}
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