import React from "react";

export default function ProbBar({ value }) {
  const percentage = Math.round(value * 100);

  const color =
    value > 0.7
      ? "bg-red-500"
      : value > 0.4
      ? "bg-orange-400"
      : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="text-xs font-mono text-slate-300 w-10">
        {percentage}%
      </span>
    </div>
  );
}
