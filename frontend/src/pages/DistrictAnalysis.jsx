import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import districtService from "../services/districtService";

import DistrictRiskChart from "../components/charts/DistrictRiskChart";
import DistrictRankingTable from "../components/tables/DistrictRankingTable";


// ============================================
// DISTRICT ANALYSIS
// ============================================

export default function DistrictAnalysis({
  selectedDistrict: initialDistrict = "All",
}) {

  const {
    district: urlDistrict,
  } = useParams();


  const [data, setData] =
    useState([]);

  const [
    selectedDistrict,
    setSelectedDistrict,
  ] = useState(initialDistrict);

  const [
    selectedDetail,
    setSelectedDetail,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ============================================
  // LOAD DISTRICT RANKING
  // ============================================

  useEffect(() => {

    const loadDistrictRanking =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await districtService
              .getDistrictRanking();

          console.log(
            "District Ranking API:",
            response
          );

          setData(
            response?.data || []
          );

        } catch (err) {

          console.error(
            "District ranking error:",
            err
          );

          setError(
            "Failed to load district ranking"
          );

        } finally {

          setLoading(false);

        }

      };


    loadDistrictRanking();

  }, []);


  // ============================================
  // URL DISTRICT
  // ============================================

  useEffect(() => {

    if (
      urlDistrict &&
      data.length > 0
    ) {

      const matchedDistrict =
        data.find(
          (item) =>
            String(
              item.district
            ).toLowerCase() ===
            String(
              urlDistrict
            ).toLowerCase()
        );


      if (matchedDistrict) {

        setSelectedDistrict(
          matchedDistrict.district
        );

      }

    }

  }, [
    urlDistrict,
    data,
  ]);


  // ============================================
  // DASHBOARD SELECTED DISTRICT
  // ============================================

  useEffect(() => {

    if (
      initialDistrict &&
      initialDistrict !== "All"
    ) {

      setSelectedDistrict(
        initialDistrict
      );

    }

  }, [
    initialDistrict,
  ]);


  // ============================================
  // LOAD SELECTED DISTRICT DETAIL
  // ============================================

  useEffect(() => {

    if (
      !selectedDistrict ||
      selectedDistrict === "All"
    ) {

      setSelectedDetail(null);

      return;

    }


    const loadDistrictDetail =
      async () => {

        try {

          setDetailLoading(true);

          const response =
            await districtService
              .getDistrictAnalysis(
                selectedDistrict
              );

          console.log(
            "District Detail API:",
            response
          );

          setSelectedDetail(
            response
          );

        } catch (err) {

          console.error(
            "District detail error:",
            err
          );

          setSelectedDetail(null);

        } finally {

          setDetailLoading(false);

        }

      };


    loadDistrictDetail();

  }, [
    selectedDistrict,
  ]);


  // ============================================
  // DISTRICT LIST
  // ============================================

  const districts =
    useMemo(() => {

      return [
        ...new Set(
          data.map(
            (item) =>
              item.district
          )
        ),
      ].sort();

    }, [
      data,
    ]);


  // ============================================
  // FILTER DATA
  // ============================================

  const filteredData =
    useMemo(() => {

      if (
        selectedDistrict === "All"
      ) {

        return data;

      }


      return data.filter(
        (item) =>
          item.district ===
          selectedDistrict
      );

    }, [
      data,
      selectedDistrict,
    ]);


  // ============================================
  // SUMMARY
  // ============================================

  const totalPredictions =
    filteredData.length;


  const highRiskCount =
    filteredData.filter(
      (item) =>
        item.risk_level ===
        "HIGH"
    ).length;


  const mediumRiskCount =
    filteredData.filter(
      (item) =>
        item.risk_level ===
        "MEDIUM"
    ).length;


  const lowRiskCount =
    filteredData.filter(
      (item) =>
        item.risk_level ===
        "LOW"
    ).length;


  const averageProbability =
    selectedDetail
      ? Number(
          selectedDetail
            .average_surge_probability
        )
      : filteredData.length > 0
        ? filteredData.reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                Number(
                  item.surge_probability
                ) || 0
              ),
            0
          ) /
          filteredData.length
        : 0;


  // ============================================
  // SELECTED DISTRICT RANK
  // ============================================

  const selectedRank =
    selectedDetail?.rank ||
    filteredData[0]?.rank ||
    null;


  // ============================================
  // 2 WEEK FORECAST
  // ============================================

  const forecastData =
    selectedDetail?.forecast_2w || [];


  const totalForecastCases =
    forecastData.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Number(
            item?.expected_cases_2w
          ) || 0
        ),
      0
    );


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="p-6 text-white">
        Loading District Analysis...
      </div>

    );

  }


  // ============================================
  // ERROR
  // ============================================

  if (error) {

    return (

      <div className="p-6 text-red-400">
        {error}
      </div>

    );

  }


  // ============================================
  // UI
  // ============================================

  return (

    <div className="space-y-6 p-6">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="
        flex
        flex-col
        gap-4
        md:flex-row
        md:items-center
        md:justify-between
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-white
          ">
            District Analysis
          </h1>

          <p className="
            mt-1
            text-slate-400
          ">
            Statewide district risk ranking
            and two-week outbreak forecast
          </p>

        </div>


        <select

          value={
            selectedDistrict
          }

          onChange={(e) =>
            setSelectedDistrict(
              e.target.value
            )
          }

          className="
            rounded-lg
            border
            border-slate-700
            bg-slate-800
            px-4
            py-2
            text-white
          "
        >

          <option value="All">
            All Districts
          </option>


          {districts.map(
            (district) => (

              <option
                key={district}
                value={district}
              >
                {district}
              </option>

            )
          )}

        </select>

      </div>


      {/* ====================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================== */}

      <div className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-4
      ">

        <div className="
          rounded-xl
          bg-slate-800
          p-4
        ">

          <h3 className="text-gray-400">
            Total Districts
          </h3>

          <p className="
            mt-1
            text-3xl
            font-bold
            text-white
          ">
            {data.length}
          </p>

        </div>


        <div className="
          rounded-xl
          bg-red-900
          p-4
        ">

          <h3 className="text-red-200">
            High Risk
          </h3>

          <p className="
            mt-1
            text-3xl
            font-bold
            text-white
          ">
            {highRiskCount}
          </p>

        </div>


        <div className="
          rounded-xl
          bg-yellow-700
          p-4
        ">

          <h3 className="text-yellow-100">
            Medium Risk
          </h3>

          <p className="
            mt-1
            text-3xl
            font-bold
            text-white
          ">
            {mediumRiskCount}
          </p>

        </div>


        <div className="
          rounded-xl
          bg-green-700
          p-4
        ">

          <h3 className="text-green-100">
            Low Risk
          </h3>

          <p className="
            mt-1
            text-3xl
            font-bold
            text-white
          ">
            {lowRiskCount}
          </p>

        </div>

      </div>


      {/* ====================================== */}
      {/* SELECTED DISTRICT DETAILS */}
      {/* ====================================== */}

      {selectedDistrict !== "All" && (

        <div className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-3
        ">

          {/* RANK */}

          <div className="
            rounded-xl
            bg-slate-800
            p-5
          ">

            <p className="
              text-sm
              text-slate-400
            ">
              Overall District Rank
            </p>

            <p className="
              mt-2
              text-4xl
              font-bold
              text-cyan-400
            ">

              {detailLoading
                ? "..."
                : selectedRank
                  ? `#${selectedRank}`
                  : "N/A"}

            </p>

            <p className="
              mt-2
              text-xs
              text-slate-500
            ">
              Relative to available statewide
              district predictions
            </p>

          </div>


          {/* AVERAGE PROBABILITY */}

          <div className="
            rounded-xl
            bg-slate-800
            p-5
          ">

            <p className="
              text-sm
              text-slate-400
            ">
              Average Surge Probability
            </p>

            <p className="
              mt-2
              text-4xl
              font-bold
              text-orange-400
            ">

              {(averageProbability * 100).toFixed(1)}%

            </p>

          </div>


          {/* TOTAL 2-WEEK FORECAST */}

          <div className="
            rounded-xl
            bg-slate-800
            p-5
          ">

            <p className="
              text-sm
              text-slate-400
            ">
              2 Week Forecast
            </p>

            <p className="
              mt-2
              text-4xl
              font-bold
              text-cyan-400
            ">

              {detailLoading
                ? "..."
                : totalForecastCases}

            </p>

            <p className="
              mt-2
              text-xs
              text-slate-500
            ">
              Combined expected cases across
              available diseases
            </p>

          </div>

        </div>

      )}


      {/* ====================================== */}
      {/* RISK CHART */}
      {/* ====================================== */}

      <div className="
        rounded-xl
        bg-slate-800
        p-4
      ">

        <DistrictRiskChart
          data={data}
        />

      </div>


      {/* ====================================== */}
      {/* RANKING TABLE */}
      {/* ====================================== */}

      <div className="
        rounded-xl
        bg-slate-800
        p-4
      ">

        <DistrictRankingTable
          data={data}
        />

      </div>


      {/* ====================================== */}
      {/* SELECTED DISTRICT FORECAST */}
      {/* ====================================== */}

      {selectedDistrict !== "All" &&
        forecastData.length > 0 && (

          <div className="
            rounded-xl
            bg-slate-800
            p-4
          ">

            <h2 className="
              mb-4
              text-xl
              font-semibold
              text-white
            ">
              {selectedDistrict} — 2 Week Forecast
            </h2>


            <div className="overflow-x-auto">

              <table className="
                w-full
                text-sm
              ">

                <thead>

                  <tr className="
                    bg-slate-900
                    text-slate-300
                  ">

                    <th className="
                      px-4
                      py-3
                      text-left
                    ">
                      Disease
                    </th>

                    <th className="
                      px-4
                      py-3
                      text-left
                    ">
                      Prediction Week
                    </th>

                    <th className="
                      px-4
                      py-3
                      text-left
                    ">
                      Expected Cases
                    </th>

                    <th className="
                      px-4
                      py-3
                      text-left
                    ">
                      Surge Probability
                    </th>

                    <th className="
                      px-4
                      py-3
                      text-left
                    ">
                      Risk Level
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {forecastData.map(
                    (
                      forecast,
                      index
                    ) => (

                      <tr
                        key={
                          `${forecast.disease}-${forecast.year}-${forecast.week_number}-${index}`
                        }
                        className="
                          border-b
                          border-slate-800
                        "
                      >

                        {/* DISEASE */}

                        <td className="
                          px-4
                          py-3
                          text-white
                        ">
                          {forecast.disease || "N/A"}
                        </td>


                        {/* PREDICTION WEEK */}

                        <td className="
                          px-4
                          py-3
                          text-cyan-300
                        ">
                          {forecast.year
                            ? `${forecast.year}-W${String(
                                forecast.week_number || 0
                              ).padStart(2, "0")}`
                            : "N/A"}
                        </td>


                        {/* EXPECTED CASES */}

                        <td className="
                          px-4
                          py-3
                          text-cyan-400
                        ">
                          {forecast.expected_cases_2w ?? 0}
                        </td>


                        {/* PROBABILITY */}

                        <td className="
                          px-4
                          py-3
                          text-orange-400
                        ">

                          {(
                            Number(
                              forecast.surge_probability
                            ) * 100
                          ).toFixed(1)}%

                        </td>


                        {/* RISK LEVEL */}

                        <td className="
                          px-4
                          py-3
                          text-white
                        ">
                          {forecast.risk_level || "LOW"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

    </div>

  );

}