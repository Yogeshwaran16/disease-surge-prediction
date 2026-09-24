import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SurgePredictionChart({
  data = [],
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-white text-lg font-bold mb-4">
        Surge Prediction Forecast
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <CartesianGrid stroke="#334155" />

          <XAxis
            dataKey="week"
            stroke="#94a3b8"
          />

          <YAxis stroke="#94a3b8" />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="predictedCases"
            fill="#f97316"
            stroke="#f97316"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
