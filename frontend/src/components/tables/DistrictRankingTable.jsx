import React, {
  useMemo,
} from "react";


function RiskBadge({
  level,
}) {

  const normalizedLevel =
    String(
      level ||
      "LOW"
    )
      .toUpperCase()
      .trim();


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

      className={
        `px-2 py-1 rounded text-xs font-bold border ${
          styles[
            normalizedLevel
          ] ||
          styles.LOW
        }`
      }

    >

      {
        normalizedLevel
      }

    </span>

  );

}


export default function DistrictRankingTable({
  data = [],
}) {


  const districtRanking =
    useMemo(() => {

      const districtMap = {};


      data.forEach(
        (item) => {

          const district =
            String(
              item?.district ||
              item?.district_name ||
              ""
            ).trim();


          if (
            !district
          ) {
            return;
          }


          const key =
            district.toLowerCase();


          const probability =
            Number(
              item?.surge_probability
            ) || 0;


          const cases =
            Number(
              item?.expected_cases_2w ||
              item?.expected_cases
            ) || 0;


          const risk =
            String(
              item?.risk_level ||
              "LOW"
            )
              .toUpperCase()
              .trim();


          if (
            !districtMap[key]
          ) {

            districtMap[key] = {

              district,

              rank: Number(item?.rank) || 999,

              surge_probability:
                probability,

              expected_cases_2w:
                cases,

              risk_level:
                risk,

            };

          }

          else if (

            probability >

            districtMap[key]
              .surge_probability

          ) {

            districtMap[key] = {

  district,

  rank: Number(item?.rank) || 999,

  surge_probability:
    probability,

  expected_cases_2w:
    cases,

  risk_level:
    risk,

};
          }

        }
      );


      return Object.values(
        districtMap
      )

       .sort(
  (a, b) =>
    a.rank - b.rank
);

    }, [
      data,
    ]);


  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">


      <div className="px-4 py-3 border-b border-slate-800">

        <h2 className="text-lg font-bold text-white">

          District Ranking

        </h2>


        <p className="text-xs text-slate-500">

          Ranked by statewide risk score
        </p>

      </div>


      <div className="overflow-x-auto">

        <table className="w-full text-sm">


          <thead>

            <tr className="bg-slate-800 text-slate-300">

              <th className="px-4 py-3 text-left">
                Rank
              </th>

              <th className="px-4 py-3 text-left">
                District
              </th>

              <th className="px-4 py-3 text-left">
                Probability
              </th>

              <th className="px-4 py-3 text-left">
                Expected Cases
              </th>

              <th className="px-4 py-3 text-left">
                Risk Level
              </th>

            </tr>

          </thead>


          <tbody>

            {

              districtRanking.length > 0

                ? (

                  districtRanking.map(
                    (
                      district,
                      index
                    ) => (

                      <tr

                        key={
                          district.district
                        }

                        className="border-b border-slate-800 hover:bg-slate-800/40"

                      >

                        <td className="px-4 py-3 text-cyan-400 font-bold">

                         #{district.rank}
                         
                        </td>


                        <td className="px-4 py-3 text-white font-semibold">

                          {
                            district.district
                          }

                        </td>


                        <td className="px-4 py-3 text-orange-400">

                          {(
                            district.surge_probability *
                            100
                          ).toFixed(1)}

                          %

                        </td>


                        <td className="px-4 py-3 text-slate-300">

                          {
                            district.expected_cases_2w
                          }

                        </td>


                        <td className="px-4 py-3">

                          <RiskBadge

                            level={
                              district.risk_level
                            }

                          />

                        </td>

                      </tr>

                    )
                  )

                )

                : (

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center text-slate-400 py-8"

                    >

                      No District Data Available

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
