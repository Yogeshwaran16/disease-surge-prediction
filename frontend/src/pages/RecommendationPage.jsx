import React, {
  useState,
} from "react";

import {
  generateRecommendations,
} from "../services/recommendationService";


function RecommendationPage() {

  // ============================================
  // FORM STATE
  // ============================================

  const [
    district,
    setDistrict,
  ] = useState("Chennai");


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
  ] = useState("0.88");


  const [
    confidence,
    setConfidence,
  ] = useState("0.92");


  const [
    expectedCases,
    setExpectedCases,
  ] = useState("150");


  // ============================================
  // RESPONSE STATE
  // ============================================

  const [
    data,
    setData,
  ] = useState(null);


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================

  const handleGenerate =
    async () => {

      try {

        setLoading(true);

        setError("");

        setData(null);


        const payload = {

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

        };


        console.log(
          "Recommendation Payload:",
          payload
        );


        const result =
          await generateRecommendations(
            payload
          );


        console.log(
          "Recommendation Result:",
          result
        );


        setData(result);


      } catch (err) {

        console.error(
          "Recommendation Error:",
          err
        );


        setError(
          err.message ||
          "Failed to generate recommendations"
        );


      } finally {

        setLoading(false);

      }

    };


  // ============================================
  // EXTRACT RESULT
  // ============================================

  const resultData =
    data?.data || null;


  const recommendations =
    resultData?.recommendations || [];


  const emergency =
    resultData?.emergency_escalation;


  // ============================================
  // UI
  // ============================================

  return (

    <div
      className="
        p-6
        space-y-6
        text-white
      "
    >


      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div>

        <h1
          className="
            text-3xl
            font-bold
          "
        >

          Disease Recommendation Engine

        </h1>


        <p
          className="
            text-slate-400
            mt-2
          "
        >

          AI-powered public health recommendations
          based on disease surge prediction.

        </p>

      </div>


      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div
        className="
          bg-slate-800
          rounded-xl
          p-6
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
              mb-2
              text-slate-300
            "
          >

            District

          </label>


          <input

            type="text"

            value={district}

            onChange={
              (e) =>
                setDistrict(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          />

        </div>


        {/* DISEASE */}

        <div>

          <label
            className="
              block
              mb-2
              text-slate-300
            "
          >

            Disease

          </label>


          <input

            type="text"

            value={disease}

            onChange={
              (e) =>
                setDisease(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          />

        </div>


        {/* RISK LEVEL */}

        <div>

          <label
            className="
              block
              mb-2
              text-slate-300
            "
          >

            Risk Level

          </label>


          <select

            value={riskLevel}

            onChange={
              (e) =>
                setRiskLevel(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          >

            <option value="LOW">

              LOW

            </option>


            <option value="MEDIUM">

              MEDIUM

            </option>


            <option value="HIGH">

              HIGH

            </option>


            <option value="CRITICAL">

              CRITICAL

            </option>

          </select>

        </div>


        {/* SURGE PROBABILITY */}

        <div>

          <label
            className="
              block
              mb-2
              text-slate-300
            "
          >

            Surge Probability

          </label>


          <input

            type="number"

            step="0.01"

            min="0"

            max="1"

            value={probability}

            onChange={
              (e) =>
                setProbability(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          />

        </div>


        {/* CONFIDENCE */}

        <div>

          <label
            className="
              block
              mb-2
              text-slate-300
            "
          >

            Confidence Score

          </label>


          <input

            type="number"

            step="0.01"

            min="0"

            max="1"

            value={confidence}

            onChange={
              (e) =>
                setConfidence(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          />

        </div>


        {/* EXPECTED CASES */}

        <div>

          <label
            className="
              block
              mb-2
              text-slate-300
            "
          >

            Expected Cases (2 Weeks)

          </label>


          <input

            type="number"

            min="0"

            value={expectedCases}

            onChange={
              (e) =>
                setExpectedCases(
                  e.target.value
                )
            }

            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              text-white
            "

          />

        </div>


      </div>


      {/* ====================================== */}
      {/* GENERATE BUTTON */}
      {/* ====================================== */}

      <button

        onClick={
          handleGenerate
        }

        disabled={
          loading
        }

        className="
          px-6
          py-3
          rounded-lg
          bg-blue-600
          hover:bg-blue-700
          disabled:bg-slate-600
          font-semibold
        "

      >

        {

          loading

            ? "Generating Recommendations..."

            : "Generate AI Recommendations"

        }

      </button>


      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {

        error && (

          <div
            className="
              bg-red-900
              border
              border-red-700
              rounded-xl
              p-4
              text-red-100
            "
          >

            {error}

          </div>

        )

      }


      {/* ====================================== */}
      {/* RESULT */}
      {/* ====================================== */}

      {

        resultData && (

          <div
            className="
              space-y-6
            "
          >


            {/* SUMMARY */}

            <div
              className="
                bg-slate-800
                rounded-xl
                p-6
              "
            >

              <h2
                className="
                  text-xl
                  font-bold
                  mb-4
                "
              >

                Prediction Summary

              </h2>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                "
              >


                <div>

                  <p className="text-slate-400">

                    District

                  </p>

                  <p className="font-semibold">

                    {resultData.district}

                  </p>

                </div>


                <div>

                  <p className="text-slate-400">

                    Disease

                  </p>

                  <p className="font-semibold">

                    {resultData.disease}

                  </p>

                </div>


                <div>

                  <p className="text-slate-400">

                    Risk Level

                  </p>

                  <p
                    className="
                      font-bold
                      text-red-400
                    "
                  >

                    {resultData.risk_level}

                  </p>

                </div>


              </div>


              {

                emergency && (

                  <div
                    className="
                      mt-5
                      bg-red-950
                      border
                      border-red-700
                      rounded-lg
                      p-4
                    "
                  >

                    🚨 Emergency escalation recommended

                  </div>

                )

              }

            </div>


            {/* RECOMMENDATIONS */}

            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                  mb-4
                "
              >

                Recommended Actions

              </h2>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >

                {

                  recommendations.map(
                    (
                      item,
                      index
                    ) => (

                      <div

                        key={index}

                        className="
                          bg-slate-800
                          rounded-xl
                          p-5
                          border
                          border-slate-700
                        "

                      >

                        <div
                          className="
                            flex
                            justify-between
                            items-start
                            gap-3
                          "
                        >

                          <h3
                            className="
                              font-bold
                              text-lg
                            "
                          >

                            {item.category}

                          </h3>


                          <span
                            className="
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              bg-red-900
                              text-red-200
                            "
                          >

                            {item.priority}

                          </span>

                        </div>


                        <p
                          className="
                            text-slate-300
                            mt-4
                          "
                        >

                          {item.action}

                        </p>


                        <p
                          className="
                            text-slate-400
                            text-sm
                            mt-4
                          "
                        >

                          ⏱ Timeline:{" "}

                          {item.timeline}

                        </p>

                      </div>

                    )

                  )

                }

              </div>

            </div>


          </div>

        )

      }


    </div>

  );

}


export default RecommendationPage;
