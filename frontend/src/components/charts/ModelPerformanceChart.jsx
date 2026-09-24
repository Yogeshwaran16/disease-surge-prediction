import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function ModelPerformanceChart({
  data = [],
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-white text-lg font-bold mb-4">
        Model Performance
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid stroke="#334155" />

          <XAxis
            dataKey="disease"
            stroke="#94a3b8"
          />

          <YAxis
            domain={[55, 80]}
            stroke="#94a3b8"
          />

          <Tooltip />
          <Legend />

          <Bar
            dataKey="baseline"
            fill="#64748b"
          />

          <Bar
            dataKey="enriched"
            fill="#06b6d4"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
