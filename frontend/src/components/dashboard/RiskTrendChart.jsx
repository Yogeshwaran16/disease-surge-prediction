import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";


// ============================================
// RISK TREND CHART
// ============================================

export default function RiskTrendChart({
  data = [],
  title = "Risk Trend",
  subtitle = "Disease outbreak risk over time",
}) {

  // ------------------------------------------
  // NORMALIZE DATA
  // ------------------------------------------

  const chartData = Array.isArray(data)
    ? data.map((item, index) => ({
        name:
          item?.name ||
          item?.date ||
          item?.label ||
          `Point ${index + 1}`,

        high: Number(
          item?.high ??
          item?.HIGH ??
          item?.high_risk ??
          0
        ),

        medium: Number(
          item?.medium ??
          item?.MEDIUM ??
          item?.medium_risk ??
          0
        ),

        low: Number(
          item?.low ??
          item?.LOW ??
          item?.low_risk ??
          0
        ),
      }))
    : [];


  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (chartData.length === 0) {

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

        <div>

          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>

        </div>

        <div className="mt-5 flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-800">

          <div className="text-center">

            <div className="text-3xl">
              📈
            </div>

            <p className="mt-2 text-sm text-slate-400">
              No trend data available
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Risk trends will appear when prediction history is available
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // TOOLTIP
  // ==========================================

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {

    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xl">

        <p className="mb-2 text-xs font-semibold text-slate-300">
          {label}
        </p>

        {payload.map((item) => (

          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6 py-1"
          >

            <span className="text-xs text-slate-400">
              {item.name}
            </span>

            <span className="text-xs font-semibold text-white">
              {item.value}
            </span>

          </div>

        ))}

      </div>
    );
  };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
    >

      {/* HEADER */}

      <div>

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>


      {/* CHART */}

      <div className="mt-6 h-[300px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.4}
            />

            <XAxis
              dataKey="name"
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
              axisLine={{
                stroke: "#334155",
              }}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
              axisLine={{
                stroke: "#334155",
              }}
              tickLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
            />

            <Legend
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "10px",
              }}
            />

            <Line
              type="monotone"
              dataKey="high"
              name="High Risk"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{
                r: 3,
              }}
              activeDot={{
                r: 5,
              }}
            />

            <Line
              type="monotone"
              dataKey="medium"
              name="Medium Risk"
              stroke="#eab308"
              strokeWidth={3}
              dot={{
                r: 3,
              }}
              activeDot={{
                r: 5,
              }}
            />

            <Line
              type="monotone"
              dataKey="low"
              name="Low Risk"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{
                r: 3,
              }}
              activeDot={{
                r: 5,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </motion.div>
  );
}