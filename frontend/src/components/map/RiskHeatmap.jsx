import React from "react";
import { motion } from "framer-motion";
import TamilNaduMap from "../components/map/TamilNaduMap";
import useDashboardStore from "../store/dashboardStore";


// ============================================
// RISK HEATMAP PAGE
// ============================================

export default function RiskHeatmap() {

  const topRiskDistricts =
    useDashboardStore(
      (state) => state.topRiskDistricts
    );

  const totalDistricts =
    useDashboardStore(
      (state) => state.totalDistricts
    );

  const totalPredictions =
    useDashboardStore(
      (state) => state.totalPredictions
    );

  const riskCounts =
    useDashboardStore(
      (state) => state.riskCounts
    );

  const connected =
    useDashboardStore(
      (state) => state.connected
    );

  const lastUpdated =
    useDashboardStore(
      (state) => state.lastUpdated
    );


  // ==========================================
  // COMBINE AVAILABLE DISTRICT DATA
  // ==========================================

  const districts =
    Array.isArray(topRiskDistricts)
      ? topRiskDistricts
      : [];


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="space-y-6">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <motion.div

        initial={{
          opacity: 0,
          y: -10,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <p className="
            text-sm
            font-medium
            text-cyan-400
          ">
            COMMAND CENTER
          </p>

          <h1 className="
            mt-1
            text-3xl
            font-bold
            text-white
          ">
            Risk Heatmap
          </h1>

          <p className="
            mt-2
            max-w-2xl
            text-sm
            text-slate-400
          ">
            Real-time district-level disease
            outbreak risk across Tamil Nadu.
          </p>

        </div>


        {/* CONNECTION STATUS */}

        <div className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-slate-700
          bg-slate-900
          px-4
          py-2
        ">

          <span
            className={`
              h-2.5
              w-2.5
              rounded-full
              ${connected
                ? "bg-green-500 animate-pulse"
                : "bg-red-500"
              }
            `}
          />

          <span className="
            text-xs
            font-medium
            text-slate-300
          ">
            {connected
              ? "LIVE"
              : "OFFLINE"
            }
          </span>

        </div>

      </motion.div>


      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="
        grid
        grid-cols-2
        gap-4
        lg:grid-cols-4
      ">

        {/* TOTAL DISTRICTS */}

        <div className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-4
        ">

          <p className="
            text-xs
            text-slate-500
          ">
            Total Districts
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-white
          ">
            {totalDistricts}
          </p>

        </div>


        {/* PREDICTIONS */}

        <div className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-4
        ">

          <p className="
            text-xs
            text-slate-500
          ">
            Predictions
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-white
          ">
            {totalPredictions}
          </p>

        </div>


        {/* HIGH RISK */}

        <div className="
          rounded-2xl
          border
          border-red-500/30
          bg-red-500/10
          p-4
        ">

          <p className="
            text-xs
            text-red-400
          ">
            High Risk
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-white
          ">
            {riskCounts?.HIGH ?? 0}
          </p>

        </div>


        {/* MEDIUM RISK */}

        <div className="
          rounded-2xl
          border
          border-yellow-500/30
          bg-yellow-500/10
          p-4
        ">

          <p className="
            text-xs
            text-yellow-400
          ">
            Medium Risk
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-white
          ">
            {riskCounts?.MEDIUM ?? 0}
          </p>

        </div>

      </div>


      {/* ====================================== */}
      {/* MAP */}
      {/* ====================================== */}

      <TamilNaduMap
        districts={districts}
        height="600px"
      />


      {/* ====================================== */}
      {/* MAP INFORMATION */}
      {/* ====================================== */}

      <div className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-3
      ">

        {/* HIGH */}

        <div className="
          rounded-xl
          border
          border-red-500/20
          bg-slate-900
          p-4
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            <span className="
              h-3
              w-3
              rounded-full
              bg-red-500
            />

            <span className="
              text-sm
              font-semibold
              text-white
            ">
              High Risk
            </span>

          </div>

          <p className="
            mt-2
            text-xs
            text-slate-500
          ">
            Immediate preventive and
            surveillance action recommended.
          </p>

        </div>


        {/* MEDIUM */}

        <div className="
          rounded-xl
          border
          border-yellow-500/20
          bg-slate-900
          p-4
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            <span className="
              h-3
              w-3
              rounded-full
              bg-yellow-500
            />

            <span className="
              text-sm
              font-semibold
              text-white
            ">
              Medium Risk
            </span>

          </div>

          <p className="
            mt-2
            text-xs
            text-slate-500
          ">
            Continue monitoring and strengthen
            local surveillance.
          </p>

        </div>


        {/* LOW */}

        <div className="
          rounded-xl
          border
          border-green-500/20
          bg-slate-900
          p-4
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            <span className="
              h-3
              w-3
              rounded-full
              bg-green-500
            />

            <span className="
              text-sm
              font-semibold
              text-white
            ">
              Low Risk
            </span>

          </div>

          <p className="
            mt-2
            text-xs
            text-slate-500
          ">
            Routine monitoring and
            preventive measures.
          </p>

        </div>

      </div>


      {/* ====================================== */}
      {/* LAST UPDATED */}
      {/* ====================================== */}

      <div className="
        flex
        flex-col
        gap-1
        border-t
        border-slate-800
        pt-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <p className="
          text-xs
          text-slate-500
        ">
          Dashboard data updates automatically
          through WebSocket.
        </p>

        <p className="
          text-xs
          text-slate-500
        ">
          Last updated:{" "}
          <span className="text-slate-400">
            {lastUpdated
              ? new Date(
                  lastUpdated
                ).toLocaleString()
              : "Waiting for data"
            }
          </span>
        </p>

      </div>

    </div>

  );
}
