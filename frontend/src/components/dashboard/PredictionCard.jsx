import React from "react";
import { motion } from "framer-motion";


// ============================================
// PREDICTION CARD
// ============================================

export default function PredictionCard({
  district,
  disease = "Unknown",
  probability = 0,
  riskLevel = "LOW",
  cases = 0,
  updatedAt = null,
}) {

  // ------------------------------------------
  // NORMALIZE DATA
  // ------------------------------------------

  const risk =
    String(riskLevel || "LOW").toUpperCase();

  const numericProbability =
    Number(probability) || 0;

  const numericCases =
    Number(cases) || 0;


  // ------------------------------------------
  // PROBABILITY
  // ------------------------------------------

  const probabilityPercent =
    numericProbability <= 1
      ? numericProbability * 100
      : numericProbability;

  const safeProbability =
    Math.min(
      Math.max(probabilityPercent, 0),
      100
    );

  const formattedProbability =
    safeProbability.toFixed(1);


  // ------------------------------------------
  // RISK CONFIG
  // ------------------------------------------

  const riskConfig = {

    HIGH: {
      label: "HIGH RISK",
      badge:
        "bg-red-500/20 text-red-400 border-red-500/30",
      bar:
        "bg-red-500",
    },

    MEDIUM: {
      label: "MEDIUM RISK",
      badge:
        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      bar:
        "bg-yellow-500",
    },

    LOW: {
      label: "LOW RISK",
      badge:
        "bg-green-500/20 text-green-400 border-green-500/30",
      bar:
        "bg-green-500",
    },

  };

  const config =
    riskConfig[risk] || riskConfig.LOW;


  // ------------------------------------------
  // UPDATED TIME
  // ------------------------------------------

  const formattedUpdatedAt = (() => {
    if (!updatedAt) return "Not available";

    const value = String(updatedAt);

    // Prediction week format: 2025-W48
    if (/^\d{4}-W\d{2}$/.test(value)) {
      return value;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString();
  })();


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <motion.div

      initial={{
        opacity: 0,
        scale: 0.96,
      }}

      animate={{
        opacity: 1,
        scale: 1,
      }}

      whileHover={{
        y: -3,
      }}

      transition={{
        duration: 0.3,
      }}

      className="
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
        p-5
        shadow-lg
      "
    >

      {/* ------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------ */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            District Prediction
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            {district || "Unknown District"}
          </h3>

        </div>


        <span
          className={`
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            whitespace-nowrap
            ${config.badge}
          `}
        >
          {config.label}
        </span>

      </div>


      {/* ------------------------------------ */}
      {/* DISEASE */}
      {/* ------------------------------------ */}

      <div className="mt-6 rounded-xl bg-slate-800/60 p-4">

        <p className="text-xs text-slate-500">
          Predicted Disease
        </p>

        <p className="mt-1 text-lg font-semibold text-white">
          {disease}
        </p>

      </div>


      {/* ------------------------------------ */}
      {/* PROBABILITY + CASES */}
      {/* ------------------------------------ */}

      <div className="mt-4 grid grid-cols-2 gap-4">

        <div>

          <p className="text-xs text-slate-500">
            Probability
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {formattedProbability}%
          </p>

        </div>


        <div>

          <p className="text-xs text-slate-500">
            Predicted Cases
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {numericCases.toLocaleString()}
          </p>

        </div>

      </div>


      {/* ------------------------------------ */}
      {/* PROBABILITY BAR */}
      {/* ------------------------------------ */}

      <div className="mt-5">

        <div className="mb-2 flex justify-between">

          <span className="text-xs text-slate-500">
            Outbreak Probability
          </span>

          <span className="text-xs font-medium text-slate-400">
            {formattedProbability}%
          </span>

        </div>


        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

          <motion.div

            initial={{
              width: 0,
            }}

            animate={{
              width: `${safeProbability}%`,
            }}

            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}

            className={`
              h-full
              rounded-full
              ${config.bar}
            `}
          />

        </div>

      </div>


      {/* ------------------------------------ */}
      {/* LAST UPDATED */}
      {/* ------------------------------------ */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">

        <span className="text-xs text-slate-500">
          Last Updated
        </span>

        <span className="text-xs text-slate-400">
          {formattedUpdatedAt}
        </span>

      </div>

    </motion.div>

  );
}

