import React, {
  useMemo,
} from "react";


function RiskBadge({
  level,
}) {

  const styles = {

    CRITICAL:
      "bg-red-700/30 text-red-300 border-red-500/50",

    HIGH:
      "bg-red-500/20 text-red-400 border-red-500/30",

    MEDIUM:
      "bg-orange-500/20 text-orange-400 border-orange-500/30",

    LOW:
      "bg-green-500/20 text-green-400 border-green-500/30",

  };


  return (

    <span
      className={`
        px-2
        py-1
        rounded
        text-xs
        font-bold
        border
        ${
          styles[level] ||
          styles.LOW
        }
      `}
    >

      {level || "LOW"}

    </span>

  );

}


export default function RiskTable({

  data = [],

  title = "Disease Risk Table",

  onRecommend,

  onPlanResources,

}) {


  // ============================================
  // GET LATEST DATA FOR EACH DISTRICT
  // ============================================

  const latestDistrictData =
    useMemo(() => {

      const districtMap = {};


      data.forEach((item) => {

        const district =
          item?.district;


        if (!district) {

          return;

        }


        const year =
          Number(
            item?.year
          ) || 0;


        const week =
          Number(
            item?.week_number
          ) || 0;


        if (!districtMap[district]) {

          districtMap[district] =
            item;

        }

        else {

          const oldYear =
            Number(
              districtMap[district]
                ?.year
            ) || 0;


          const oldWeek =
            Number(
              districtMap[district]
                ?.week_number
            ) || 0;


          if (

            year > oldYear ||

            (

              year === oldYear &&

              week > oldWeek

            )

          ) {

            districtMap[district] =
              item;

          }

        }

      });


      return Object
        .values(
          districtMap
        )
        .sort(

          (a, b) =>

            (

              b.surge_probability ||

              0

            )

            -

            (

              a.surge_probability ||

              0

            )

        );

    }, [
      data
    ]);


  // ============================================
  // UI
  // ============================================

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        overflow-hidden
      "
    >


      {/* ========================================
          HEADER
      ======================================== */}

      <div
        className="
          px-4
          py-3
          border-b
          border-slate-800
        "
      >

        <h2
          className="
            text-lg
            font-bold
            text-white
          "
        >

          {title}

        </h2>


        <p
          className="
            text-xs
            text-slate-500
            mt-1
          "
        >

          Latest Prediction For Each District

        </p>

      </div>


      {/* ========================================
          TABLE
      ======================================== */}

      <div className="overflow-x-auto">

        <table className="w-full text-sm">


          {/* ====================================
              TABLE HEADER
          ==================================== */}

          <thead>

            <tr
              className="
                bg-slate-800
                text-slate-300
              "
            >

              <th className="text-left px-4 py-3">

                District

              </th>


              <th className="text-left px-4 py-3">

                Disease

              </th>


              <th className="text-left px-4 py-3">

                Probability

              </th>


              <th className="text-left px-4 py-3">

                Expected Cases

              </th>


              <th className="text-left px-4 py-3">

                Risk Level

              </th>


              <th className="text-left px-4 py-3">

                Year

              </th>


              <th className="text-left px-4 py-3">

                Week

              </th>


              <th className="text-left px-4 py-3">

                Action

              </th>

            </tr>

          </thead>


          {/* ====================================
              TABLE BODY
          ==================================== */}

          <tbody>

            {

              latestDistrictData.length > 0

                ? (

                  latestDistrictData.map(

                    (
                      row,
                      index
                    ) => (

                      <tr

                        key={
                          `${row.district}-${index}`
                        }

                        className="
                          border-b
                          border-slate-800
                          hover:bg-slate-800/40
                        "
                      >


                        {/* DISTRICT */}

                        <td
                          className="
                            px-4
                            py-3
                            text-white
                            font-semibold
                          "
                        >

                          {row.district}

                        </td>


                        {/* DISEASE */}

                        <td
                          className="
                            px-4
                            py-3
                            text-slate-300
                          "
                        >

                          {
                            row.disease ||
                            "Dengue"
                          }

                        </td>


                        {/* PROBABILITY */}

                        <td
                          className="
                            px-4
                            py-3
                            text-cyan-400
                          "
                        >

                          {

                            (

                              (

                                row.surge_probability ||

                                0

                              )

                              *

                              100

                            ).toFixed(1)

                          }

                          %

                        </td>


                        {/* EXPECTED CASES */}

                        <td
                          className="
                            px-4
                            py-3
                            text-slate-300
                          "
                        >

                          {
                            row.expected_cases_2w ||
                            0
                          }

                        </td>


                        {/* RISK LEVEL */}

                        <td
                          className="
                            px-4
                            py-3
                          "
                        >

                          <RiskBadge
                            level={
                              row.risk_level
                            }
                          />

                        </td>


                        {/* YEAR */}

                        <td
                          className="
                            px-4
                            py-3
                            text-slate-300
                          "
                        >

                          {
                            row.year ||
                            "-"
                          }

                        </td>


                        {/* WEEK */}

                        <td
                          className="
                            px-4
                            py-3
                            text-slate-300
                          "
                        >

                          {
                            row.week_number ||
                            "-"
                          }

                        </td>


                        {/* ==================================
                            ACTION BUTTONS
                        ================================== */}

                        <td
                          className="
                            px-4
                            py-3
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              whitespace-nowrap
                            "
                          >


                            {/* AI RECOMMEND */}

                            <button

                              type="button"

                              onClick={() => {

                                if (
                                  onRecommend
                                ) {

                                  onRecommend(
                                    row
                                  );

                                }

                              }}

                              className="
                                px-3
                                py-2
                                rounded-lg
                                bg-cyan-600
                                hover:bg-cyan-500
                                text-white
                                text-xs
                                font-semibold
                                transition
                              "
                            >

                              AI Recommend

                            </button>


                            {/* PLAN RESOURCES */}

                            <button

                              type="button"

                              onClick={() => {

                                if (
                                  onPlanResources
                                ) {

                                  onPlanResources(
                                    row
                                  );

                                }

                              }}

                              className="
                                px-3
                                py-2
                                rounded-lg
                                bg-purple-600
                                hover:bg-purple-500
                                text-white
                                text-xs
                                font-semibold
                                transition
                              "
                            >

                              Plan Resources

                            </button>


                          </div>

                        </td>


                      </tr>

                    )

                  )

                )

                : (

                  <tr>

                    <td

                      colSpan="8"

                      className="
                        text-center
                        py-8
                        text-slate-400
                      "
                    >

                      No Prediction Data Available

                    </td>

                  </tr>

                )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}
