import React, {
  useEffect,
  useState,
} from "react";

import {
  generateRecommendations,
} from "../services/recommendationService";


export default function AIRecommendations({
  prediction,
}) {

  // ============================================
  // FORM STATE
  // ============================================

  const [
    district,
    setDistrict,
  ] = useState("");


  const [
    disease,
    setDisease,
  ] = useState("Dengue");


  const [
    riskLevel,
    setRiskLevel,
  ] = useState("HIGH");


  const [
    probability,
    setProbability,
  ] = useState(0);


  const [
    confidence,
    setConfidence,
  ] = useState(0.91);


  const [
    expectedCases,
    setExpectedCases,
  ] = useState(0);


  // ============================================
  // API STATE
  // ============================================

  const [
    result,
    setResult,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ============================================
  // RECOMMENDATION HISTORY
  // LOAD FROM LOCAL STORAGE
  // ============================================

  const [
    history,
    setHistory,
  ] = useState(() => {

    try {

      const savedHistory =
        localStorage.getItem(
          "recommendationHistory"
        );

      return savedHistory
        ? JSON.parse(savedHistory)
        : [];

    } catch (error) {

      console.error(
        "History Load Error:",
        error
      );

      return [];

    }

  });


  // ============================================
  // SAVE HISTORY TO LOCAL STORAGE
  // ============================================

  useEffect(() => {

    try {

      localStorage.setItem(
        "recommendationHistory",
        JSON.stringify(history)
      );

    } catch (error) {

      console.error(
        "History Save Error:",
        error
      );

    }

  }, [history]);


  // ============================================
  // AUTO-FILL SELECTED PREDICTION
  // ============================================

  useEffect(() => {

    if (!prediction) {

      return;

    }

    console.log(
      "Selected Prediction:",
      prediction
    );

    setDistrict(
      prediction.district || ""
    );

    setDisease(
      prediction.disease || "Dengue"
    );

    setRiskLevel(
      prediction.risk_level || "LOW"
    );

    setProbability(
      prediction.surge_probability || 0
    );

    setConfidence(
      prediction.confidence_score || 0.91
    );

    setExpectedCases(
      prediction.expected_cases_2w || 0
    );

    setResult(null);

    setError("");

  }, [prediction]);


  // ============================================
  // PRIORITY STYLE
  // ============================================

  const getPriorityStyle =
    (priority) => {

      const styles = {

        CRITICAL:
          "bg-red-700/30 text-red-300 border border-red-500/50",

        HIGH:
          "bg-red-500/20 text-red-400 border border-red-500/30",

        MEDIUM:
          "bg-orange-500/20 text-orange-400 border border-orange-500/30",

        LOW:
          "bg-green-500/20 text-green-400 border border-green-500/30",

      };

      return (
        styles[priority] ||
        styles.LOW
      );

    };


  // ============================================
  // RISK TEXT STYLE
  // ============================================

  const getRiskStyle =
    (risk) => {

      const styles = {

        CRITICAL:
          "text-red-300",

        HIGH:
          "text-red-400",

        MEDIUM:
          "text-orange-400",

        LOW:
          "text-green-400",

      };

      return (
        styles[risk] ||
        styles.LOW
      );

    };


  // ============================================
  // EXTRACT ACTIONS
  // ============================================

  const extractActions =
    (data) => {

      if (!data) {

        return [];

      }

      const recommendations =
        data.recommendations ||
        data.actions ||
        data.action_plan ||
        data;

      if (
        Array.isArray(
          recommendations
        )
      ) {

        return recommendations;

      }

      if (
        typeof recommendations ===
        "object"
      ) {

        const actions = [];

        Object.values(
          recommendations
        ).forEach(
          (value) => {

            if (
              Array.isArray(value)
            ) {

              value.forEach(
                (item) => {

                  if (
                    item &&
                    typeof item ===
                    "object"
                  ) {

                    actions.push(item);

                  }

                }
              );

            }

            else if (
              value &&
              typeof value ===
              "object"
            ) {

              Object.values(
                value
              ).forEach(
                (nestedValue) => {

                  if (
                    Array.isArray(
                      nestedValue
                    )
                  ) {

                    nestedValue.forEach(
                      (item) => {

                        if (
                          item &&
                          typeof item ===
                          "object"
                        ) {

                          actions.push(item);

                        }

                      }
                    );

                  }

                }
              );

            }

          }
        );

        return actions;

      }

      return [];

    };


  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================

  const handleGenerate =
    async () => {

      if (
        !district.trim()
      ) {

        setError(
          "Please enter a district."
        );

        return;

      }

      try {

        setLoading(true);

        setError("");

        setResult(null);

        const response =
          await generateRecommendations({

            district:
              district.trim(),

            disease:
              disease.trim(),

            risk_level:
              riskLevel,

            surge_probability:
              Number(probability),

            confidence_score:
              Number(confidence),

            expected_cases_2w:
              Number(expectedCases),

          });

        const recommendationData =
          response?.data ||
          response;

        console.log(
          "Recommendation Response:",
          recommendationData
        );

        setResult(
          recommendationData
        );


        // ======================================
        // SAVE NEW RECOMMENDATION TO HISTORY
        // ======================================

        setHistory(
          (previousHistory) => [

            {
              ...recommendationData,

              id:
                Date.now(),

              district:
                recommendationData.district ||
                district,

              disease:
                recommendationData.disease ||
                disease,

              risk_level:
                recommendationData.risk_level ||
                riskLevel,

              generated_at:
                new Date()
                  .toLocaleString(),

            },

            ...previousHistory,

          ]
        );

      } catch (error) {

        console.error(
          "Recommendation Error:",
          error
        );

        setError(

          error.message ||

          "Recommendation generation failed"

        );

      } finally {

        setLoading(false);

      }

    };


  // ============================================
  // NEW RECOMMENDATION
  // ============================================

  const handleNewRecommendation =
    () => {

      setResult(null);

      setError("");

    };


  // ============================================
  // CLEAR HISTORY
  // ============================================

  const handleClearHistory =
    () => {

      setHistory([]);

    };

    // ============================================
// DELETE SINGLE HISTORY ITEM
// ============================================

const handleDeleteHistory =
  (id) => {

    setHistory(
      (previousHistory) =>
        previousHistory.filter(
          (item) =>
            item.id !== id
        )
    );

  };

  // ============================================
  // LOAD OLD HISTORY RESULT
  // ============================================

  const handleHistoryClick =
    (item) => {

      setDistrict(
        item.district || ""
      );

      setDisease(
        item.disease || "Dengue"
      );

      setRiskLevel(
        item.risk_level || "LOW"
      );

      setResult(item);

      setError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };


  // ============================================
  // ACTIONS
  // ============================================

  const actions =
    extractActions(
      result
    );


  // ============================================
  // UI
  // ============================================

  return (

    <div className="space-y-6">


      {/* HEADER */}
      

      <div>

        <h1 className="text-3xl font-bold text-white">

          AI Recommendations

        </h1>

        <p className="text-slate-400 mt-2">

          AI-powered disease surge response
          recommendations for health authorities.

        </p>

        {

          prediction && (

            <p className="text-cyan-400 text-sm mt-2">

              Selected prediction loaded:
              {" "}

              {prediction.district}

              {" - "}

              {
                prediction.disease ||
                "Dengue"
              }

            </p>

          )

        }

      </div>


      {/* INPUT PANEL */}

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
            text-xl
            font-bold
            text-white
            mb-5
          "
        >

          Prediction Details

        </h2>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4
          "
        >

          <div>

            <label className="text-sm text-slate-400">

              District

            </label>

            <input
              value={district}
              onChange={(event) =>
                setDistrict(
                  event.target.value
                )
              }
              placeholder="Enter district"
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
                outline-none
                focus:border-cyan-500
              "
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">

              Disease

            </label>

            <input
              value={disease}
              onChange={(event) =>
                setDisease(
                  event.target.value
                )
              }
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
                outline-none
                focus:border-cyan-500
              "
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">

              Risk Level

            </label>

            <select
              value={riskLevel}
              onChange={(event) =>
                setRiskLevel(
                  event.target.value
                )
              }
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
              "
            >

              <option value="CRITICAL">
                CRITICAL
              </option>

              <option value="HIGH">
                HIGH
              </option>

              <option value="MEDIUM">
                MEDIUM
              </option>

              <option value="LOW">
                LOW
              </option>

            </select>

          </div>


          <div>

            <label className="text-sm text-slate-400">

              Surge Probability

            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={probability}
              onChange={(event) =>
                setProbability(
                  event.target.value
                )
              }
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
              "
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">

              Confidence Score

            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={confidence}
              onChange={(event) =>
                setConfidence(
                  event.target.value
                )
              }
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
              "
            />

          </div>


          <div>

            <label className="text-sm text-slate-400">

              Expected Cases

            </label>

            <input
              type="number"
              value={expectedCases}
              onChange={(event) =>
                setExpectedCases(
                  event.target.value
                )
              }
              className="
                w-full
                mt-2
                px-4
                py-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                text-white
              "
            />

          </div>

        </div>


        {/* ERROR */}

        {

          error && (

            <div
              className="
                mt-5
                bg-red-500/10
                border
                border-red-500/30
                rounded-lg
                p-4
                text-red-400
              "
            >

              {error}

            </div>

          )

        }


        {/* BUTTONS */}

        <div
          className="
            flex
            flex-wrap
            gap-3
            mt-6
          "
        >

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="
              px-5
              py-3
              rounded-lg
              bg-cyan-600
              hover:bg-cyan-500
              disabled:bg-slate-700
              disabled:cursor-not-allowed
              text-white
              font-semibold
              transition
            "
          >

            {

              loading

                ? "Generating..."

                : "Generate AI Recommendations"

            }

          </button>


          {

            result && (

              <button
                onClick={
                  handleNewRecommendation
                }
                className="
                  px-5
                  py-3
                  rounded-lg
                  bg-slate-800
                  hover:bg-slate-700
                  text-white
                  font-semibold
                  transition
                "
              >

                New Recommendation

              </button>

            )

          }

        </div>

      </div>


      {/* RESULT */}

      {

        result && (

          <div className="space-y-5">


            {/* RESULT SUMMARY */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                p-6
              "
            >

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

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-white
                    "
                  >

                    Recommendation Summary

                  </h2>

                  <p
                    className="
                      text-slate-400
                      mt-2
                    "
                  >

                    {result.district || district}

                    {" - "}

                    {
                      result.disease ||
                      disease
                    }

                  </p>

                </div>


                <span
                  className={`
                    px-4
                    py-2
                    rounded-lg
                    font-bold
                    ${getPriorityStyle(
                      result.risk_level ||
                      riskLevel
                    )}
                  `}
                >

                  {
                    result.risk_level ||
                    riskLevel
                  }

                </span>

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                  mt-6
                "
              >

                <div
                  className="
                    bg-slate-800
                    rounded-lg
                    p-4
                  "
                >

                  <p className="text-slate-400 text-sm">

                    Surge Probability

                  </p>

                  <p className="text-2xl font-bold text-cyan-400 mt-2">

                    {(
                      Number(
                        result.surge_probability ??
                        probability
                      ) * 100
                    ).toFixed(1)}

                    %

                  </p>

                </div>


                <div
                  className="
                    bg-slate-800
                    rounded-lg
                    p-4
                  "
                >

                  <p className="text-slate-400 text-sm">

                    Confidence

                  </p>

                  <p className="text-2xl font-bold text-white mt-2">

                    {(
                      Number(
                        result.confidence_score ??
                        confidence
                      ) * 100
                    ).toFixed(1)}

                    %

                  </p>

                </div>


                <div
                  className="
                    bg-slate-800
                    rounded-lg
                    p-4
                  "
                >

                  <p className="text-slate-400 text-sm">

                    Expected Cases

                  </p>

                  <p className="text-2xl font-bold text-white mt-2">

                    {
                      result.expected_cases_2w ??
                      expectedCases
                    }

                  </p>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div>

              <h2
                className="
                  text-xl
                  font-bold
                  text-white
                  mb-4
                "
              >

                Recommended Actions

              </h2>


              {

                actions.length > 0

                  ? (

                    <div
                      className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                      "
                    >

                      {

                        actions.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="
                                bg-slate-900
                                border
                                border-slate-800
                                rounded-xl
                                p-5
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-4
                                "
                              >

                                <h3
                                  className="
                                    text-lg
                                    font-semibold
                                    text-white
                                  "
                                >

                                  {
                                    item.title ||
                                    item.action ||
                                    item.name ||
                                    `Action ${
                                      index + 1
                                    }`
                                  }

                                </h3>


                                {

                                  item.priority && (

                                    <span
                                      className={`
                                        px-2
                                        py-1
                                        rounded
                                        text-xs
                                        font-bold
                                        ${getPriorityStyle(
                                          item.priority
                                        )}
                                      `}
                                    >

                                      {
                                        item.priority
                                      }

                                    </span>

                                  )

                                }

                              </div>


                              <p
                                className="
                                  text-slate-400
                                  mt-3
                                  leading-relaxed
                                "
                              >

                               {
  item.description ||
  item.action ||
  item.message ||
  item.details ||
  "No action description available."
}

                              </p>


                              {

                                item.timeline && (

                                  <p
                                    className="
                                      text-slate-500
                                      text-sm
                                      mt-4
                                    "
                                  >

                                    Timeline:
                                    {" "}

                                    <span
                                      className="
                                        text-slate-300
                                      "
                                    >

                                      {
                                        item.timeline
                                      }

                                    </span>

                                  </p>

                                )

                              }

                            </div>

                          )

                        )

                      }

                    </div>

                  )

                  : (

                    <div
                      className="
                        bg-slate-900
                        border
                        border-slate-800
                        rounded-xl
                        p-6
                        text-slate-400
                      "
                    >

                      Recommendation generated successfully,
                      but no action list was returned.

                    </div>

                  )

              }

            </div>

          </div>

        )

      }


      {/* RECOMMENDATION HISTORY */}

      {

        history.length > 0 && (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-6
            "
          >

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

                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >

                  Recommendation History

                </h2>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >

                  Recently generated
                  AI recommendations

                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <span
                  className="
                    text-sm
                    text-cyan-400
                  "
                >

                  {history.length}
                  {" "}
                  Generated

                </span>


                <button
                  onClick={
                    handleClearHistory
                  }
                  className="
                    px-4
                    py-2
                    rounded-lg
                    bg-red-500/10
                    hover:bg-red-500/20
                    border
                    border-red-500/30
                    text-red-400
                    text-sm
                    transition
                  "
                >

                  Clear History

                </button>

              </div>

            </div>


            <div
              className="
                space-y-3
                mt-5
              "
            >

              {

                history.map(
  (item) => (

    <div
      key={item.id}
      className="
        w-full
        bg-slate-800
        border
        border-slate-700
        hover:border-cyan-500/50
        rounded-lg
        p-4
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
      "
    >

      {/* HISTORY DETAILS */}

      <button
        onClick={() =>
          handleHistoryClick(item)
        }
        className="
          flex-1
          text-left
        "
      >

        <h3
          className="
            font-semibold
            text-white
          "
        >

          {item.district}
          {" - "}
          {item.disease || "Dengue"}

        </h3>

        <p
          className="
            text-sm
            text-slate-400
            mt-1
          "
        >

          Generated: {" "}
          {item.generated_at}

        </p>

        <p
          className="
            text-xs
            text-cyan-400
            mt-2
          "
        >

          Click to view recommendation

        </p>

      </button>


      {/* RISK + DELETE */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <span
          className={`
            px-3
            py-1
            rounded-lg
            text-sm
            font-semibold
            ${getPriorityStyle(
              item.risk_level || "LOW"
            )}
          `}
        >

          {item.risk_level || "LOW"}

        </span>


        <button
          onClick={() =>
            handleDeleteHistory(
              item.id
            )
          }
          className="
            px-3
            py-2
            rounded-lg
            bg-red-500/10
            hover:bg-red-500/20
            border
            border-red-500/30
            text-red-400
            text-xs
            font-semibold
            transition
          "
        >

          Delete

        </button>

      </div>

    </div>

  )
)

              }

            </div>

          </div>

        )

      }

    </div>

  );

}

