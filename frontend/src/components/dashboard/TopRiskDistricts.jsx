import React from "react";
import { motion } from "framer-motion";
import DistrictCard from "./DistrictCard";

export default function TopRiskDistricts({
  districts = [],
  limit = 5,
  onDistrictSelect,
}) {
  const safeDistricts = Array.isArray(districts) ? districts : [];

  const sortedDistricts = [...safeDistricts]
    .sort((a, b) => {
      const probabilityA = Number(
        a?.surge_probability ??
        a?.probability ??
        a?.risk_probability ??
        0
      );

      const probabilityB = Number(
        b?.surge_probability ??
        b?.probability ??
        b?.risk_probability ??
        0
      );

      return probabilityB - probabilityA;
    })
    .slice(0, limit);

  if (sortedDistricts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Top Risk Districts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Highest outbreak probability districts
          </p>
        </div>

        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-800">
          <div className="text-center">
            <div className="text-3xl">??</div>
            <p className="mt-2 text-sm text-slate-400">
              No prediction data available
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Dashboard will update when predictions arrive
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Top Risk Districts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Districts ranked by outbreak probability
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
          Top {sortedDistricts.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sortedDistricts.map((district, index) => {
          const key =
            district?.district || `district-${index}`;

          const probability = Number(
            district?.surge_probability ??
            district?.probability ??
            district?.risk_probability ??
            0
          );

          const cases = Number(
            district?.expected_cases_2w ??
            district?.cases ??
            district?.predicted_cases ??
            0
          );

          const updatedAt =
            district?.year && district?.week_number
              ? `${district.year}-W${String(
                  district.week_number
                ).padStart(2, "0")}`
              : district?.updated_at ||
                district?.generated_at ||
                null;

          return (
            <motion.div
              key={`${key}-${index}`}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
            >
              <DistrictCard
                district={
                  district?.district ||
                  "Unknown District"
                }

                disease={
                  district?.disease ||
                  "Unknown"
                }

                riskLevel={
                  district?.risk_level ||
                  district?.riskLevel ||
                  "LOW"
                }

                probability={probability}

                cases={cases}

                updatedAt={updatedAt}

                onClick={() =>
                  onDistrictSelect?.(
                    district?.district
                  )
                }
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
