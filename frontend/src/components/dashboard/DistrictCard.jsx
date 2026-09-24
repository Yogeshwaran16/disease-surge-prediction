import React from "react";
import { motion } from "framer-motion";


// ============================================
// DISTRICT CARD
// ============================================

export default function DistrictCard({
  district,
  disease = "N/A",
  riskLevel = "LOW",
  probability = 0,
  cases = 0,
  updatedAt = null,
  onClick,
}) {

  // ------------------------------------------
  // NORMALIZE VALUES
  // ------------------------------------------

  const normalizedRisk =
    String(riskLevel || "LOW").toUpperCase();

  const numericProbability =
    Number(probability) || 0;

  const numericCases =
    Number(cases) || 0;


  // ------------------------------------------
  // RISK CONFIGURATION
  // ------------------------------------------

  const riskConfig = {

    HIGH: {
      badge:
        "bg-red-500/20 text-red-400 border-red-500/30",

      border:
        "border-red-500/30",

      indicator:
        "bg-red-500",

      label:
        "HIGH RISK",
    },

    MEDIUM: {
      badge:
        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",

      border:
        "border-yellow-500/30",

      indicator:
        "bg-yellow-500",

      label:
        "MEDIUM RISK",
    },

    LOW: {
      badge:
        "bg-green-500/20 text-green-400 border-green-500/30",

      border:
        "border-green-500/30",

      indicator:
        "bg-green-500",

      label:
        "LOW RISK",
    },

  };


  const config =
    riskConfig[normalizedRisk] ||
    riskConfig.LOW;


  // ------------------------------------------
  // PROBABILITY FORMAT
  // ------------------------------------------

  const probabilityPercent =
    numericProbability <= 1
      ? numericProbability * 100
      : numericProbability;


  const formattedProbability =
    Math.min(
      Math.max(probabilityPercent, 0),
      100
    ).toFixed(1);


  // ------------------------------------------
  // UPDATED TIME
  // ------------------------------------------

  const formattedUpdatedAt = (() => {
    if (!updatedAt) return "Not available";

    const value = String(updatedAt);

    // Prediction week format: 2025-W52
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
        y: 15,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      whileHover={{
        y: -3,
      }}

      transition={{
        duration: 0.3,
      }}

      onClick={onClick}

      className={`
        rounded-2xl
        border
        bg-slate-900
        p-5
        shadow-lg
        transition
        cursor-pointer
        ${config.border}
      `}
    >

      {/* ------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------ */}

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`
              h-3
              w-3
              rounded-full
              ${config.indicator}
            `}
          />

          <div>

            <h3 className="text-lg font-semibold text-white">
              {district || "Unknown District"}
            </h3>

            <p className="text-xs text-slate-500">
              District Prediction
            </p>

          </div>

        </div>


        {/* RISK BADGE */}

        <span
          className={`
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${config.badge}
          `}
        >
          {config.label}
        </span>

      </div>


      {/* ------------------------------------ */}
      {/* DISEASE */}
      {/* ------------------------------------ */}

      <div className="mt-5">

        <p className="text-xs uppercase tracking-wide text-slate-500">
          Predicted Disease
        </p>

        <p className="mt-1 text-base font-semibold text-slate-200">
          {disease}
        </p>

      </div>


      {/* ------------------------------------ */}
      {/* STATS */}
      {/* ------------------------------------ */}

      <div className="mt-5 grid grid-cols-2 gap-4">

        {/* PROBABILITY */}

        <div className="rounded-xl bg-slate-800/70 p-3">

          <p className="text-xs text-slate-500">
            Outbreak Probability
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {formattedProbability}%
          </p>

        </div>


        {/* CASES */}

        <div className="rounded-xl bg-slate-800/70 p-3">

          <p className="text-xs text-slate-500">
            Predicted Cases
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {numericCases.toLocaleString()}
          </p>

        </div>

      </div>


      {/* ------------------------------------ */}
      {/* PROBABILITY BAR */}
      {/* ------------------------------------ */}

      <div className="mt-5">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs text-slate-500">
            Risk Probability
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
              width: `${formattedProbability}%`,
            }}

            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}

            className={`
              h-full
              rounded-full
              ${config.indicator}
            `}
          />

        </div>

      </div>


      {/* ------------------------------------ */}
      {/* LAST UPDATED */}
      {/* ------------------------------------ */}

      <div className="mt-5 border-t border-slate-800 pt-3">

        <p className="text-xs text-slate-500">
          Last Updated
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formattedUpdatedAt}
        </p>

      </div>


    </motion.div>

  );

}
