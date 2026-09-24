import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getDashboardSummary,
} from "../services/dashboardService";

import HospitalStatusPanel from "../components/resource/HospitalStatusPanel";

// ============================================
// API URL
// ============================================

const API_URL =
  "http://127.0.0.1:8000/api/v1/resource-planning/generate";


// ============================================
// RESOURCE PLANNING
// ============================================

export default function ResourcePlanning({
  data = [],
  prediction = null,
}) {


  // ==========================================
  // PREDICTION DATA
  // ==========================================

  const [
    predictionData,
    setPredictionData,
  ] = useState([]);


  // ==========================================
  // SELECTED PREDICTION
  // ==========================================

  const [
    selectedPrediction,
    setSelectedPrediction,
  ] = useState(null);


  // ==========================================
  // RESOURCE PLAN DATA
  // ==========================================

  const [
    resourceData,
    setResourceData,
  ] = useState(null);


  // ==========================================
  // HOSPITAL RESOURCE DATA
  // ==========================================

  const [
    hospitalResourceData,
    setHospitalResourceData,
  ] = useState(null);

  const [
    loadingHospitalResource,
    setLoadingHospitalResource,
  ] = useState(false);


  // ==========================================
  // LOADING PREDICTIONS
  // ==========================================

  const [
    loadingPredictions,
    setLoadingPredictions,
  ] = useState(false);


  // ==========================================
  // GENERATING PLAN
  // ==========================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================
  // ERROR
  // ==========================================

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // LOAD PREDICTIONS
  // ==========================================

  useEffect(() => {

    const loadPredictionData =
      async () => {

        // USE APP DATA FIRST

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {

          setPredictionData(data);

          return;

        }


        // LOAD FROM API

        try {

          setLoadingPredictions(true);

          setError("");


          const response =
            await getDashboardSummary();


          const districts =
            response?.all_districts ||
            [];


          setPredictionData(districts);


        } catch (err) {

          console.error(
            "Prediction Load Error:",
            err
          );


          setError(
            "Failed to load prediction data."
          );


        } finally {

          setLoadingPredictions(false);

        }

      };


    loadPredictionData();


  }, [
    data
  ]);


  // ==========================================
  // LATEST DISTRICT RECORD
  // ==========================================

  const latestDistrictData =
    useMemo(() => {

      const districtMap = {};


      predictionData.forEach(
        (item) => {

          const district =
            item?.district;


          if (!district) {

            return;

          }


          const existing =
            districtMap[district];


          if (!existing) {

            districtMap[district] =
              item;

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


          const existingYear =
            Number(
              existing?.year
            ) || 0;


          const existingWeek =
            Number(
              existing?.week_number
            ) || 0;


          if (

            year > existingYear ||

            (
              year === existingYear &&
              week > existingWeek
            )

          ) {

            districtMap[district] =
              item;

          }

        }
      );


      return Object
        .values(
          districtMap
        )
        .sort(
          (a, b) =>

            String(
              a?.district || ""
            ).localeCompare(

              String(
                b?.district || ""
              )

            )

        );


    }, [
      predictionData
    ]);


  // ==========================================
  // LOAD HOSPITAL RESOURCE STATUS
  // ==========================================

  useEffect(() => {

    const loadHospitalResource = async () => {

      const district =
        selectedPrediction?.district;

      if (!district) {

        setHospitalResourceData(null);

        return;

      }

      try {

        setLoadingHospitalResource(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/hospitals/${encodeURIComponent(
            district
          )}`
        );

        if (!response.ok) {

          throw new Error(
            `Hospital resource request failed: ${response.status}`
          );

        }

        const result =
          await response.json();

        setHospitalResourceData(
          result?.data || null
        );

      } catch (err) {

        console.error(
          "Hospital Resource Load Error:",
          err
        );

        setHospitalResourceData(null);

      } finally {

        setLoadingHospitalResource(false);

      }

    };

    loadHospitalResource();

  }, [
    selectedPrediction?.district
  ]);


  // ==========================================
  // AUTO SELECT PREDICTION
  // ==========================================

  useEffect(() => {


    // SELECTED FROM AI PAGE

    if (prediction) {

      setSelectedPrediction(
        prediction
      );

      setResourceData(
        null
      );

      setError(
        ""
      );

      return;

    }


    // KEEP CURRENT SELECTION

    if (
      selectedPrediction
    ) {

      const exists =
        latestDistrictData.find(
          (item) =>

            item?.district ===
            selectedPrediction?.district
        );


      if (exists) {

        return;

      }

    }


    // SELECT FIRST DISTRICT

    if (
      latestDistrictData.length > 0
    ) {

      setSelectedPrediction(
        latestDistrictData[0]
      );

    }


  }, [
    prediction,
    latestDistrictData
  ]);


  // ==========================================
  // DISTRICT CHANGE
  // ==========================================

  const handleDistrictChange =
    (event) => {

      const district =
        event.target.value;


      const selected =
        latestDistrictData.find(
          (item) =>

            item?.district ===
            district
        );


      if (selected) {

        setSelectedPrediction(
          selected
        );


        setResourceData(
          null
        );


        setError(
          ""
        );

      }

    };


  // ==========================================
  // GENERATE RESOURCE PLAN
  // ==========================================

  const generateResourcePlan =
    async () => {

      if (!selectedPrediction) {

        setError(
          "Please select a district first."
        );

        return;

      }


      try {

        setLoading(true);

        setError("");

        setResourceData(null);


        const response =
          await fetch(

            API_URL,

            {

              method:
                "POST",


              headers: {

                "Content-Type":
                  "application/json",

              },


              body:

                JSON.stringify({

                  district:

                    selectedPrediction?.district ||
                    "Unknown",


                  disease:

                    selectedPrediction?.disease ||
                    "Dengue",


                  risk_level:

                    selectedPrediction?.risk_level ||
                    "LOW",


                  expected_cases_2w:

                    Number(
                      selectedPrediction
                        ?.expected_cases_2w
                    ) || 100,

                }),

            }

          );


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(
                () => null
              );


          throw new Error(

            errorData?.detail ||

            errorData?.message ||

            "Failed to generate resource plan."

          );

        }


        const result =
          await response.json();


        if (!result?.success) {

          throw new Error(

            result?.message ||

            "Resource plan generation failed."

          );

        }


        setResourceData(
          result?.data ||
          null
        );


      } catch (err) {

        console.error(
          "Resource Planning Error:",
          err
        );


        setError(

          err?.message ||

          "Failed to connect to Resource Planning API."

        );


      } finally {

        setLoading(false);

      }

    };

      // ==========================================
  // TEST EMERGENCY RESOURCE PLAN
  // ==========================================

  const testEmergencyPlan =
    async () => {

      try {

        setLoading(true);

        setError("");

        setResourceData(null);


        const response =
          await fetch(

            API_URL,

            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              body:
                JSON.stringify({

                  district:
                    "Madurai",

                  disease:
                    "Dengue",

                  risk_level:
                    "CRITICAL",

                  expected_cases_2w:
                    5000,

                }),

            }

          );


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(
                () => null
              );


          throw new Error(

            errorData?.detail ||

            errorData?.message ||

            "Failed to generate emergency resource plan."

          );

        }


        const result =
          await response.json();


        if (!result?.success) {

          throw new Error(

            result?.message ||

            "Emergency resource plan generation failed."

          );

        }


        // UPDATE SELECTED PREDICTION

        setSelectedPrediction({

          district:
            "Madurai",

          disease:
            "Dengue",

          risk_level:
            "CRITICAL",

          expected_cases_2w:
            5000,

        });


        // UPDATE RESOURCE DATA

        setResourceData(
          result?.data || null
        );


      } catch (err) {

        console.error(
          "Emergency Test Error:",
          err
        );


        setError(

          err?.message ||

          "Failed to generate emergency resource plan."

        );


      } finally {

        setLoading(false);

      }

    };

// ==========================================
// RESOURCE STATUS
// ==========================================

const getStatus =
  (item) => {

    const backendStatus =
      String(
        item?.status || ""
      )
        .toUpperCase()
        .trim();


    if (
      backendStatus === "AVAILABLE"
    ) {

      return {
        label: "Available",
        style:
          "bg-green-500/20 text-green-400 border-green-500/30",
      };

    }


    if (
      backendStatus === "WARNING"
    ) {

      return {
        label: "Warning",
        style:
          "bg-orange-500/20 text-orange-400 border-orange-500/30",
      };

    }


    if (
      backendStatus === "CRITICAL"
    ) {

      return {
        label: "Critical",
        style:
          "bg-red-500/20 text-red-400 border-red-500/30",
      };

    }


    const available =
      Number(item?.available) || 0;

    const required =
      Number(item?.required) || 0;


    if (available >= required) {

      return {
        label: "Available",
        style:
          "bg-green-500/20 text-green-400 border-green-500/30",
      };

    }


    return {
      label: "Critical",
      style:
        "bg-red-500/20 text-red-400 border-red-500/30",
    };

  };

  // ==========================================
// RISK COLOR
// ==========================================

const getRiskColor =
  (risk) => {

    const level =
      String(
        risk || "LOW"
      )
        .toUpperCase()
        .trim();

    if (
      level === "CRITICAL" ||
      level === "EMERGENCY"
    ) {

      return "text-red-500";

    }

    if (
      level === "HIGH"
    ) {

      return "text-red-400";

    }

    if (
      level === "MEDIUM" ||
      level === "MODERATE"
    ) {

      return "text-yellow-400";

    }

    return "text-green-400";

  };


  // ==========================================
  // PRIORITY VALUE
  // ==========================================

  const priorityValue =

    typeof resourceData?.priority ===
    "object"

      ?

      (

        resourceData?.priority?.level ||

        resourceData?.priority?.priority ||

        resourceData?.priority?.label ||

        resourceData?.risk_level ||

        "LOW"

      )

      :

      (

        resourceData?.priority ||

        resourceData?.risk_level ||

        "LOW"

      );


  // ==========================================
  // PRIORITY DESCRIPTION
  // ==========================================

  const priorityDescription =

    typeof resourceData?.priority ===
    "object"

      ?

      (

        resourceData?.priority?.description ||

        resourceData?.priority?.message ||

        "AI calculated resource priority."

      )

      :

      "AI calculated resource priority.";


  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  const getPriorityStyle =
    (priority) => {

      const level =
        String(
          priority || "LOW"
        )
          .toUpperCase();

    if (level === "EMERGENCY") {

      return {
        text: "text-red-500",
        bg: "bg-red-600/20",
        border: "border-red-500/50",
      };

    }

      if (
        level === "CRITICAL"
      ) {

        return {

          text:
            "text-red-400",

          bg:
            "bg-red-500/20",

          border:
            "border-red-500/40",

        };

      }


      if (
        level === "HIGH"
      ) {

        return {

          text:
            "text-red-400",

          bg:
            "bg-red-500/10",

          border:
            "border-red-500/30",

        };

      }


      if (
        level === "MEDIUM"
      ) {

        return {

          text:
            "text-yellow-400",

          bg:
            "bg-yellow-500/10",

          border:
            "border-yellow-500/30",

        };

      }


      return {

        text:
          "text-green-400",

        bg:
          "bg-green-500/10",

        border:
          "border-green-500/30",

      };

    };


  const priorityStyle =
    getPriorityStyle(
      priorityValue
    );


// ==========================================
// TOTAL RESOURCE GAP
// ==========================================

const totalShortage =

  Number(
    resourceData?.total_resource_gap
  )

  ||

  resourceData?.resources?.reduce(

    (total, item) =>

      total +

      (
        Number(item?.gap)

        ||

        Math.max(
          0,
          (Number(item?.required) || 0) -
          (Number(item?.available) || 0)
        )
      ),

    0

  )

  ||

  0;

 

  // ==========================================
  // RECOMMENDED ACTIONS
  // ==========================================

  const recommendedActions =
    Array.isArray(
      resourceData?.recommended_actions
    )

      ?

      resourceData.recommended_actions

      :

      [];


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      className="
        p-6
        space-y-6
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
              text-white
            "
          >
            AI Resource Planning
          </h1>

          <p
            className="
              text-slate-400
              mt-1
            "
          >
            AI-based healthcare resource
            planning for disease surge response
          </p>

        </div>


        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >

          <button
            type="button"
            onClick={generateResourcePlan}
            disabled={loading || !selectedPrediction}
            className="
              px-5
              py-3
              rounded-lg
              bg-cyan-600
              hover:bg-cyan-500
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              font-semibold
              transition
            "
          >
            {
              loading
                ?
                "Generating..."
                :
                "Generate AI Resource Plan"
            }
          </button>


          <button
            type="button"
            onClick={testEmergencyPlan}
            disabled={loading}
            className="
              px-5
              py-3
              rounded-lg
              font-semibold
              border
              border-red-500/50
              bg-red-950/40
              text-red-400
              hover:bg-red-900/50
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {
              loading
                ?
                "Generating..."
                :
                "🚨 Test Emergency"
            }
          </button>

        </div>

      </div>


      {/* ERROR */}

      {

        error && (

          <div
            className="
              bg-red-500/10
              border
              border-red-500/30
              rounded-xl
              p-4
              text-red-400
            "
          >

            {error}

          </div>

        )

      }


      {/* LOADING */}

      {

        loadingPredictions && (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-8
              text-center
              text-slate-400
            "
          >

            Loading prediction data...

          </div>

        )

      }


      {/* DISTRICT SELECTION */}

      {

        !loadingPredictions && (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-6
            "
          >

            <h2
              className="
                text-lg
                font-bold
                text-white
                mb-5
              "
            >

              Select Prediction

            </h2>


            {

              latestDistrictData.length > 0

                ?

                (

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >

                    {/* DISTRICT */}

                    <div>

                      <label
                        className="
                          block
                          text-sm
                          text-slate-400
                          mb-2
                        "
                      >

                        District

                      </label>


                      <select

                        value={
                          selectedPrediction
                            ?.district || ""
                        }

                        onChange={
                          handleDistrictChange
                        }

                        className="
                          w-full
                          px-4
                          py-3
                          rounded-lg
                          bg-slate-800
                          border
                          border-slate-700
                          text-white
                          outline-none
                        "
                      >

                        {

                          latestDistrictData.map(
                            (item) => (

                              <option
                                key={
                                  item?.district
                                }

                                value={
                                  item?.district
                                }
                              >

                                {
                                  item?.district
                                }

                              </option>

                            )
                          )

                        }

                      </select>

                    </div>


                    {/* DISEASE */}

                    <div>

                      <label
                        className="
                          block
                          text-sm
                          text-slate-400
                          mb-2
                        "
                      >

                        Disease

                      </label>


                      <div
                        className="
                          px-4
                          py-3
                          rounded-lg
                          bg-slate-800
                          border
                          border-slate-700
                          text-cyan-400
                          font-semibold
                        "
                      >

                        {

                          selectedPrediction
                            ?.disease ||
                          "Dengue"

                        }

                      </div>

                    </div>


                    {/* RISK */}

                    <div>

                      <label
                        className="
                          block
                          text-sm
                          text-slate-400
                          mb-2
                        "
                      >

                        Risk Level

                      </label>


                      <div
                        className={`
                          px-4
                          py-3
                          rounded-lg
                          bg-slate-800
                          border
                          border-slate-700
                          font-semibold
                          ${getRiskColor(
                            selectedPrediction
                              ?.risk_level
                          )}
                        `}
                      >

                        {

                          selectedPrediction
                            ?.risk_level ||
                          "LOW"

                        }

                      </div>

                    </div>


                    {/* EXPECTED CASES */}

                    <div>

                      <label
                        className="
                          block
                          text-sm
                          text-slate-400
                          mb-2
                        "
                      >

                        Expected Cases (2 Weeks)

                      </label>


                      <div
                        className="
                          px-4
                          py-3
                          rounded-lg
                          bg-slate-800
                          border
                          border-slate-700
                          text-cyan-400
                          font-semibold
                        "
                      >

                        {

                          selectedPrediction
                            ?.expected_cases_2w ||
                          0

                        }

                      </div>

                    </div>

                  </div>

                )

                :

                (

                  <div
                    className="
                      text-center
                      py-8
                      text-slate-400
                    "
                  >

                    No prediction data available.

                  </div>

                )

            }

          </div>

        )

      }


      {/* HOSPITAL STATUS PANEL */}

      <div>

        {loadingHospitalResource ? (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-6
              text-center
              text-slate-400
            "
          >
            Loading hospital resource status...
          </div>

        ) : (

          <HospitalStatusPanel
            data={hospitalResourceData}
             resourcePlan={resourceData}
          />

        )}

      </div>


      {/* RESOURCE RESULTS */}

      {

        resourceData && (

          <>


            {/* SUMMARY */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >


              {/* DISTRICT */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >

                  District

                </p>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-white
                    mt-2
                  "
                >

                  {
                    resourceData?.district
                  }

                </h3>

              </div>


              {/* RISK */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >

                  Risk Level

                </p>


                <h3
                  className={`
                    text-xl
                    font-bold
                    mt-2
                    ${getRiskColor(
                      resourceData?.risk_level
                    )}
                  `}
                >

                  {
                    resourceData?.risk_level
                  }

                </h3>

              </div>


              {/* PRIORITY */}

              <div
                className={`
                  border
                  rounded-xl
                  p-5
                  ${priorityStyle.bg}
                  ${priorityStyle.border}
                `}
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >

                  AI Priority

                </p>


                <h3
                  className={`
                    text-xl
                    font-bold
                    mt-2
                    ${priorityStyle.text}
                  `}
                >

                  {priorityValue}

                </h3>

              </div>


              {/* SHORTAGES */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >

                  Resource Shortages

                </p>


                <h3
                  className={`
                    text-xl
                    font-bold
                    mt-2

                    ${
                      resourceData?.shortage_count > 0
                        ?
                        "text-red-400"
                        :
                        "text-green-400"
                    }
                  `}
                >

                  {
                    resourceData?.shortage_count ||
                    0
                  }

                </h3>

              </div>

            </div>


            {/* HOSPITAL SURGE CAPACITY */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                p-6
                mb-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-5
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-slate-400
                    "
                  >
                    Hospital Surge Capacity
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >
                    {resourceData?.surge_capacity?.percentage ?? 0}%
                  </h2>

                  <p
                    className="
                      text-sm
                      text-slate-300
                      mt-1
                    "
                  >
                    {resourceData?.surge_capacity?.status || "Unknown"}
                  </p>

                </div>

                <div
                  className="
                    w-full
                    md:w-1/2
                  "
                >

                  <div
                    className="
                      h-4
                      bg-slate-800
                      rounded-full
                      overflow-hidden
                    "
                  >

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-emerald-500
                        transition-all
                        duration-500
                      "
                      style={{
                        width: `${Math.min(
                          Number(
                            resourceData?.surge_capacity?.percentage
                          ) || 0,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                      text-slate-500
                      mt-2
                    "
                  >
                    <span>
                      Available: {
                        resourceData?.surge_capacity?.available_beds ?? 0
                      } beds
                    </span>

                    <span>
                      Required: {
                        resourceData?.surge_capacity?.required_beds ?? 0
                      } beds
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* PRIORITY PANEL */}

            <div
              className={`
                border
                rounded-xl
                p-6
                ${priorityStyle.bg}
                ${priorityStyle.border}
              `}
            >

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-5
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-slate-400
                    "
                  >

                    AI Resource Priority Assessment

                  </p>


                  <h2
                    className={`
                      text-2xl
                      font-bold
                      mt-2
                      ${priorityStyle.text}
                    `}
                  >

                    {priorityValue} PRIORITY

                  </h2>


                  <p
                    className="
                      text-slate-300
                      mt-2
                    "
                  >

                    {priorityDescription}

                  </p>

                </div>


                <div
                  className="
                    md:text-right
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-400
                    "
                  >

                    Total Resource Gap

                  </p>


                  <p
                    className="
                      text-3xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >

                    {totalShortage}

                  </p>

                </div>

              </div>

            </div>


            {/* RESOURCE TABLE */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                overflow-hidden
              "
            >

              <div
                className="
                  px-6
                  py-5
                  border-b
                  border-slate-800
                "
              >

                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >

                  Resource Requirements

                </h2>


                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >

                  AI-calculated healthcare resources
                  for the predicted disease surge.

                </p>

              </div>


              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    text-sm
                  "
                >

                  <thead>

                    <tr
                      className="
                        bg-slate-800
                        text-slate-300
                      "
                    >

                      <th className="text-left px-6 py-4">

                        Resource

                      </th>

                      <th className="text-left px-6 py-4">

                        Available

                      </th>

                      <th className="text-left px-6 py-4">

                        Required

                      </th>

                      <th className="text-left px-6 py-4">

                        Gap

                      </th>

                      <th className="text-left px-6 py-4">

                        Status

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {

                      Array.isArray(
                        resourceData?.resources
                      )

                        ?

                        resourceData.resources.map(
                          (
                            item,
                            index
                          ) => {

                            const status =
                              getStatus(
                                item
                              );


                            const gap =
                              Number(
                                item?.gap
                              )

                              ||

                              Math.max(

                                0,

                                (
                                  Number(
                                    item?.required
                                  ) || 0
                                )

                                -

                                (
                                  Number(
                                    item?.available
                                  ) || 0
                                )

                              );


                            return (

                              <tr

                                key={
                                  `${item?.resource}-${index}`
                                }

                                className="
                                  border-b
                                  border-slate-800
                                  hover:bg-slate-800/50
                                "
                              >

                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-white
                                    font-semibold
                                  "
                                >

                                  {
                                    item?.resource
                                  }

                                </td>


                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-cyan-400
                                  "
                                >

                                  {
                                    item?.available
                                  }

                                </td>


                                <td
                                  className="
                                    px-6
                                    py-4
                                    text-orange-400
                                    font-semibold
                                  "
                                >

                                  {
                                    item?.required
                                  }

                                </td>


                                <td
                                  className={`
                                    px-6
                                    py-4
                                    font-semibold

                                    ${
                                      gap > 0
                                        ?
                                        "text-red-400"
                                        :
                                        "text-green-400"
                                    }
                                  `}
                                >

                                  {gap}

                                </td>


                                <td
                                  className="
                                    px-6
                                    py-4
                                  "
                                >

                                  <span
                                    className={`
                                      inline-flex
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      border
                                      ${status.style}
                                    `}
                                  >

                                    {
                                      status.label
                                    }

                                  </span>

                                </td>

                              </tr>

                            );

                          }
                        )

                        :

                        null

                    }


                    {

                      resourceData
                        ?.resources
                        ?.length === 0 && (

                          <tr>

                            <td
                              colSpan="5"
                              className="
                                text-center
                                py-8
                                text-slate-400
                              "
                            >

                              No resource data available.

                            </td>

                          </tr>

                        )

                    }

                  </tbody>

                </table>

              </div>

            </div>


            {/* RECOMMENDED ACTIONS */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                overflow-hidden
              "
            >

              <div
                className="
                  px-6
                  py-5
                  border-b
                  border-slate-800
                "
              >

                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >

                  AI Recommended Actions

                </h2>


                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >

                  Recommended actions based on
                  disease risk and resource availability.

                </p>

              </div>


              <div
                className="
                  p-6
                "
              >

                {

                  recommendedActions.length > 0

                    ?

                    (

                      <div
                        className="
                          grid
                          grid-cols-1
                          md:grid-cols-2
                          gap-4
                        "
                      >

                        {

                          recommendedActions.map(
                            (
                              action,
                              index
                            ) => {

                              const actionText =

                                typeof action ===
                                "object"

                                  ?

                                  (

                                    action?.action ||

                                    action?.title ||

                                    action?.message ||

                                    JSON.stringify(
                                      action
                                    )

                                  )

                                  :

                                  action;


                              return (

                                <div

                                  key={
                                    `action-${index}`
                                  }

                                  className="
                                    bg-slate-800
                                    border
                                    border-slate-700
                                    rounded-xl
                                    p-4
                                    flex
                                    gap-3
                                    items-start
                                  "
                                >

                                  <div
                                    className="
                                      w-8
                                      h-8
                                      rounded-full
                                      bg-cyan-500/20
                                      text-cyan-400
                                      flex
                                      items-center
                                      justify-center
                                      font-bold
                                      flex-shrink-0
                                    "
                                  >

                                    ✓

                                  </div>


                                  <p
                                    className="
                                      text-white
                                      leading-relaxed
                                    "
                                  >

                                    {actionText}

                                  </p>

                                </div>

                              );

                            }
                          )

                        }

                      </div>

                    )

                    :

                    (

                      <div
                        className="
                          bg-green-500/10
                          border
                          border-green-500/30
                          rounded-xl
                          p-5
                          text-green-400
                        "
                      >

                        No additional emergency
                        actions required at this time.

                      </div>

                    )

                }

              </div>

            </div>

          </>

        )

      }


      {/* EMPTY STATE */}

      {

        !loading &&
        !resourceData &&
        !loadingPredictions &&
        selectedPrediction && (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-10
              text-center
            "
          >

            <h3
              className="
                text-xl
                font-bold
                text-white
              "
            >

              Generate AI Resource Plan

            </h3>


            <p
              className="
                text-slate-400
                mt-3
              "
            >

              Select a district and click
              Generate AI Resource Plan to
              calculate healthcare resource
              requirements and AI actions.

            </p>

          </div>

        )

      }


    </div>

  );

}

