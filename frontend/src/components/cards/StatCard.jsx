import React from "react";

export default function StatCard({
  label,
  value,
  sub,
  color = "text-white",
  icon = null,
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            {label}
          </p>

          <p className={`text-3xl font-black mt-1 ${color}`}>
            {value}
          </p>

          {sub && (
            <p className="text-slate-500 text-xs mt-1">
              {sub}
            </p>
          )}
        </div>

        {icon && (
          <div className="text-2xl opacity-70">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
