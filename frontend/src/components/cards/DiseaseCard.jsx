import React from "react";
import RiskBadge from "./RiskBadge";
import ProbBar from "./ProbBar";

export default function DiseaseCard({
  district,
  surgeProbability,
  expectedCases,
  riskLevel,
  rank,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-sm">
            #{rank}
          </span>

          <h3 className="font-bold text-white">
            {district}
          </h3>
        </div>

        <RiskBadge level={riskLevel} />
      </div>

      <div className="space-y-3">
        <ProbBar value={surgeProbability} />

        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            Expected Cases
          </span>

          <span className="text-cyan-400 font-bold">
            {expectedCases}
          </span>
        </div>
      </div>
    </div>
  );
}
