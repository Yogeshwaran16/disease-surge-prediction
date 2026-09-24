import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import RiskTable from "../components/tables/RiskTable";

import {
  getDashboardSummary,
} from "../services/dashboardService";


export default function Prediction({
  onRecommend,
  onPlanResources,
  onDataLoaded,
}) {

  // ============================================
  // STATE
  // ============================================

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] = useState("ALL");


  // ============================================
  // LOAD PREDICTIONS
  // ============================================

  const loadPredictions = async () => {

    try {

      setLoading(true);

      const response = await getDashboardSummary();

      const districts =
        response?.all_districts || [];

      setData(districts);


      // ==========================================
      // SEND DATA TO APP
      // ==========================================

      if (onDataLoaded) {

        onDataLoaded(districts);

      }

    } catch (error) {

      console.error(
        "Prediction Load Error:",
        error
      );

      setData([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================
  // LOAD ON START
  // ============================================

  useEffect(() => {

    loadPredictions();

  }, [onDataLoaded]);


  // ============================================
  // FILTER DATA
  // ============================================

  const filteredData = useMemo(() => {

    return data.filter((item) => {

      const district =
        String(item?.district || "")
          .toLowerCase();

      const disease =
        String(item?.disease || "")
          .toLowerCase();

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        district.includes(searchText) ||
        disease.includes(searchText);

      const matchesRisk =
        riskFilter === "ALL"
          ? true
          : item?.risk_level === riskFilter;

      return (
        matchesSearch &&
        matchesRisk
      );

    });

  }, [
    data,
    search,
    riskFilter,
  ]);


  // ============================================
  // RISK COUNTS
  // ============================================

  const highRiskCount =
    filteredData.filter(
      (item) =>
        item?.risk_level === "HIGH"
    ).length;

  const mediumRiskCount =
    filteredData.filter(
      (item) =>
        item?.risk_level === "MEDIUM"
    ).length;

  const lowRiskCount =
    filteredData.filter(
      (item) =>
        item?.risk_level === "LOW"
    ).length;


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="p-6 text-white">

        Loading Predictions...

      </div>

    );

  }


  // ============================================
  // UI
  // ============================================

  return (

    <div className="space-y-6 p-6">


      {/* ======================================
          HEADER
      ======================================= */}

      <div className="flex items-start gap-3">

        <div className="min-w-0 flex-1">

          <div className="flex items-start gap-2">

            <span
              className="
                mt-2
                h-3
                w-3
                shrink-0
                rounded-full
                bg-red-500
              "
            />

            <div className="min-w-0">

              <h3
                className="
                  text-xl
                  font-bold
                  text-white
                  break-words
                  leading-tight
                "
              >
                Disease Surge Predictions
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                District & Disease Risk Analysis
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          SUMMARY CARDS
      ======================================= */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
        "
      >

        {/* TOTAL */}

        <div
          className="
            bg-slate-800
            rounded-xl
            p-4
          "
        >

          <p className="text-slate-400">
            Total Predictions
          </p>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >
            {filteredData.length}
          </h2>

        </div>


        {/* HIGH */}

        <div
          className="
            bg-red-900
            rounded-xl
            p-4
          "
        >

          <p className="text-red-200">
            High Risk
          </p>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >
            {highRiskCount}
          </h2>

        </div>


        {/* MEDIUM */}

        <div
          className="
            bg-yellow-700
            rounded-xl
            p-4
          "
        >

          <p className="text-yellow-100">
            Medium Risk
          </p>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >
            {mediumRiskCount}
          </h2>

        </div>


        {/* LOW */}

        <div
          className="
            bg-green-700
            rounded-xl
            p-4
          "
        >

          <p className="text-green-100">
            Low Risk
          </p>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >
            {lowRiskCount}
          </h2>

        </div>

      </div>


      {/* ======================================
          FILTERS
      ======================================= */}

      <div
        className="
          bg-slate-800
          rounded-xl
          p-4
          flex
          flex-col
          md:flex-row
          gap-4
        "
      >

        <input
          type="text"
          placeholder="Search District or Disease..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="
            flex-1
            min-w-0
            px-4
            py-2
            rounded-lg
            bg-slate-900
            text-white
            border
            border-slate-700
            outline-none
            focus:border-blue-500
          "
        />


        <select
          value={riskFilter}
          onChange={(event) =>
            setRiskFilter(
              event.target.value
            )
          }
          className="
            px-4
            py-2
            rounded-lg
            bg-slate-900
            text-white
            border
            border-slate-700
            outline-none
          "
        >

          <option value="ALL">
            All Risk Levels
          </option>

          <option value="HIGH">
            High Risk
          </option>

          <option value="MEDIUM">
            Medium Risk
          </option>

          <option value="LOW">
            Low Risk
          </option>

        </select>

      </div>


      {/* ======================================
          PREDICTION TABLE
      ======================================= */}

      <RiskTable
        title="Disease Prediction Results"
        data={filteredData}
        onRecommend={onRecommend}
        onPlanResources={onPlanResources}
      />


      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {filteredData.length === 0 && (

        <div
          className="
            bg-slate-800
            rounded-xl
            p-8
            text-center
          "
        >

          <h3
            className="
              text-lg
              font-semibold
              text-white
            "
          >
            No Prediction Records Found
          </h3>

          <p className="text-slate-400 mt-2">

            Try changing the search text
            or risk filter.

          </p>

        </div>

      )}

    </div>

  );

}