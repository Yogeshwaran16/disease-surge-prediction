import React, { useMemo } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";


// ============================================
// DISTRICT RISK CHART
// ============================================

export default function DistrictRiskChart({
  data = [],
}) {

  // ==========================================
  // PREPARE CHART DATA
  // ==========================================

  const chartData = useMemo(() => {

    const grouped = {};

    data.forEach((item) => {

      const district = String(
        item?.district ||
        item?.district_name ||
        ""
      ).trim();


      if (!district) {
        return;
      }


      const riskScore =
        Number(
          item?.risk_score
        ) || 0;


      const surgeProbability =
        Number(
          item?.surge_probability
        ) || 0;


      const riskLevel =
        String(
          item?.risk_level ||
          "LOW"
        )
          .toUpperCase()
          .trim();


      const rank =
        Number(
          item?.rank
        ) || 999;


      const key =
        district.toLowerCase();


      // --------------------------------------
      // KEEP BEST RANKED ENTRY
      // --------------------------------------

      if (!grouped[key]) {

        grouped[key] = {

          district,

          rank,

          risk_score:
            riskScore,

          surge_probability:
            surgeProbability,

          risk_level:
            riskLevel,

        };

      } else if (
        rank <
        Number(
          grouped[key].rank
        )
      ) {

        grouped[key] = {

          district,

          rank,

          risk_score:
            riskScore,

          surge_probability:
            surgeProbability,

          risk_level:
            riskLevel,

        };

      }

    });


    return Object.values(grouped)

      .sort(
        (a, b) =>
          Number(a.rank) -
          Number(b.rank)
      )

      .slice(0, 15);

  }, [data]);


  // ==========================================
  // RISK COLOR
  // ==========================================

  const getColor = (
    riskLevel
  ) => {

    const level =
      String(
        riskLevel ||
        "LOW"
      ).toUpperCase();


    switch (level) {

      case "CRITICAL":
        return "#dc2626";

      case "HIGH":
        return "#ef4444";

      case "MEDIUM":
        return "#f59e0b";

      case "LOW":
        return "#22c55e";

      default:
        return "#64748b";

    }

  };


  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (
    chartData.length === 0
  ) {

    return (

      <div className="
        bg-slate-900
        rounded-xl
        p-6
      ">

        <h2 className="
          text-white
          text-xl
          font-bold
        ">
          District Risk Ranking
        </h2>


        <p className="
          text-slate-400
          mt-6
          text-center
        ">
          No district risk data available
        </p>

      </div>

    );

  }


  // ==========================================
  // CHART
  // ==========================================

  return (

    <div className="
      bg-slate-900
      rounded-xl
      p-4
    ">

      <h2 className="
        text-white
        text-2xl
        font-bold
        mb-1
      ">
        District Risk Ranking
      </h2>


      <p className="
        text-slate-400
        text-sm
        mb-4
      ">
        Top 15 districts by statewide risk score
      </p>


      <ResponsiveContainer
        width="100%"
        height={520}
      >

        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 60,
            bottom: 10,
          }}
        >

          <CartesianGrid
            stroke="#334155"
            strokeDasharray="3 3"
          />


          {/* -------------------------------- */}
          {/* RISK SCORE X AXIS */}
          {/* -------------------------------- */}

          <XAxis
            type="number"
            domain={[
              0,
              "dataMax",
            ]}
            tickFormatter={(value) =>
              `${Number(value).toFixed(0)}`
            }
            stroke="#94a3b8"
          />


          {/* -------------------------------- */}
          {/* DISTRICT Y AXIS */}
          {/* -------------------------------- */}

          <YAxis
            type="category"
            dataKey="district"
            width={140}
            stroke="#cbd5e1"
          />


          {/* -------------------------------- */}
          {/* TOOLTIP */}
          {/* -------------------------------- */}

          <Tooltip

            contentStyle={{
              background:
                "#0f172a",
              border:
                "1px solid #334155",
              borderRadius:
                "10px",
              color: "#fff",
            }}

            labelStyle={{
              color: "#fff",
            }}

            formatter={(
              value,
              name,
              props
            ) => {

              if (
                name ===
                "risk_score"
              ) {

                return [
                  Number(value).toFixed(1),
                  "Risk Score",
                ];

              }

              return [
                value,
                name,
              ];

            }}

            content={(props) => {

              if (
                !props.active ||
                !props.payload ||
                props.payload.length === 0
              ) {
                return null;
              }


              const item =
                props.payload[0]
                  ?.payload;


              if (!item) {
                return null;
              }


              return (

                <div className="
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  shadow-xl
                ">

                  <p className="
                    text-white
                    font-semibold
                    mb-2
                  ">
                    {item.district}
                  </p>


                  <p className="
                    text-cyan-400
                    text-sm
                  ">
                    Rank: #{item.rank}
                  </p>


                  <p className="
                    text-white
                    text-sm
                  ">
                    Risk Score:{" "}
                    {Number(
                      item.risk_score
                    ).toFixed(1)}
                  </p>


                  <p className="
                    text-orange-400
                    text-sm
                  ">
                    Surge Probability:{" "}
                    {(
                      Number(
                        item.surge_probability
                      ) * 100
                    ).toFixed(1)}
                    %
                  </p>


                  <p className="
                    text-sm
                    text-slate-300
                  ">
                    Risk Level:{" "}
                    {item.risk_level}
                  </p>

                </div>

              );

            }}

          />


          {/* -------------------------------- */}
          {/* RISK SCORE BAR */}
          {/* -------------------------------- */}

          <Bar
            dataKey="risk_score"
            name="Risk Score"
            radius={[
              0,
              6,
              6,
              0,
            ]}
          >

            {chartData.map(
              (
                entry,
                index
              ) => (

                <Cell
                  key={
                    `${entry.district}-${index}`
                  }
                  fill={
                    getColor(
                      entry.risk_level
                    )
                  }
                />

              )
            )}

          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}