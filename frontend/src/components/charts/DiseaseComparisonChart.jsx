import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DiseaseComparisonChart({ data = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-white text-lg font-bold mb-4">
        Disease Comparison
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="disease" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />

          <Bar
            dataKey="cases"
            fill="#06b6d4"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
