import React, {
  useEffect,
  useState,
} from "react";

import {
  getValidationScorecard,
} from "../services/api";


export default function ValidationScorecard() {

  const [
    validation,
    setValidation,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ============================================
  // LOAD VALIDATION DATA
  // ============================================

  useEffect(() => {

    const loadValidation =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await getValidationScorecard();


          console.log(
            "Validation API Response:",
            response
          );


          if (
            !response?.success
          ) {

            throw new Error(
              "Failed to load validation data"
            );

          }


          setValidation(
            response.validation
          );

        }

        catch (err) {

          console.error(
            "Validation Error:",
            err
          );


          setError(
            "Failed to load validation scorecard"
          );

        }

        finally {

          setLoading(false);

        }

      };


    loadValidation();

  }, []);


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="p-6 text-white">

        Loading Validation Scorecard...

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
  // NO DATA
  // ============================================

  if (!validation) {

    return (

      <div className="p-6 text-yellow-400">

        No validation data available

      </div>

    );

  }


  const formatPercent =
    (value) => {

      return (
        Number(value || 0) * 100
      ).toFixed(1);

    };


  return (

    <div className="space-y-6 p-6">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div>

        <h1 className="text-3xl font-bold text-white">

          Model Validation Scorecard

        </h1>


        <p className="text-slate-400 mt-2">

          AI disease surge prediction
          model performance evaluation

        </p>

      </div>


      {/* ===================================== */}
      {/* PRIMARY METRICS */}
      {/* ===================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
        "
      >


        {/* PRECISION */}

        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-5
          "
        >

          <p className="text-slate-400">

            Precision

          </p>


          <p
            className="
              text-4xl
              font-bold
              text-cyan-400
              mt-3
            "
          >

            {
              formatPercent(
                validation.precision
              )
            }

            %

          </p>


          <p
            className="
              text-xs
              text-slate-500
              mt-3
            "
          >

            Accuracy of predicted
            disease surges

          </p>

        </div>


        {/* RECALL */}

        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-5
          "
        >

          <p className="text-slate-400">

            Recall

          </p>


          <p
            className="
              text-4xl
              font-bold
              text-green-400
              mt-3
            "
          >

            {
              formatPercent(
                validation.recall
              )
            }

            %

          </p>


          <p
            className="
              text-xs
              text-slate-500
              mt-3
            "
          >

            Ability to detect
            actual disease surges

          </p>

        </div>


        {/* F1 SCORE */}

        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-5
          "
        >

          <p className="text-slate-400">

            F1 Score

          </p>


          <p
            className="
              text-4xl
              font-bold
              text-orange-400
              mt-3
            "
          >

            {
              formatPercent(
                validation.f1_score
              )
            }

            %

          </p>


          <p
            className="
              text-xs
              text-slate-500
              mt-3
            "
          >

            Balanced model
            performance score

          </p>

        </div>


      </div>


      {/* ===================================== */}
      {/* DATASET INFORMATION */}
      {/* ===================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        "
      >


        {/* DATASET SIZE */}

        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-5
          "
        >

          <p className="text-slate-400">

            Dataset Size

          </p>


          <p
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >

            {
              validation.dataset_size
                ?.toLocaleString()
            }

          </p>


          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Historical prediction records
            used for validation

          </p>

        </div>


        {/* DISTRICTS */}

        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-5
          "
        >

          <p className="text-slate-400">

            District Coverage

          </p>


          <p
            className="
              text-3xl
              font-bold
              text-white
              mt-2
            "
          >

            {
              validation.district_count
            }

          </p>


          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Tamil Nadu districts
            analysed

          </p>

        </div>


      </div>


      {/* ===================================== */}
      {/* LEAD TIME VALIDATION */}
      {/* ===================================== */}

      <div
        className="
          bg-slate-800
          border
          border-slate-700
          rounded-xl
          overflow-hidden
        "
      >


        <div
          className="
            px-6
            py-5
            border-b
            border-slate-700
          "
        >

          <h2
            className="
              text-xl
              font-bold
              text-white
            "
          >

            Lead Time Validation

          </h2>


          <p
            className="
              text-sm
              text-slate-400
              mt-1
            "
          >

            Model performance across
            different prediction horizons

          </p>

        </div>


        <div className="overflow-x-auto">

          <table
            className="
              w-full
              text-sm
            "
          >


            <thead>

              <tr
                className="
                  bg-slate-900
                  text-slate-300
                "
              >

                <th className="px-6 py-4 text-left">

                  Prediction Horizon

                </th>


                <th className="px-6 py-4 text-left">

                  Precision

                </th>


                <th className="px-6 py-4 text-left">

                  Recall

                </th>


                <th className="px-6 py-4 text-left">

                  F1 Score

                </th>


                <th className="px-6 py-4 text-left">

                  Baseline F1

                </th>


                <th className="px-6 py-4 text-left">

                  Improvement

                </th>

              </tr>

            </thead>


            <tbody>

              {
                validation
                  .lead_time_validation
                  ?.map(
                    (
                      item,
                      index
                    ) => {

                      const improvement =
                        (
                          (
                            item.f1_score -
                            item.baseline_f1
                          ) /
                          item.baseline_f1
                        ) *
                        100;


                      return (

                        <tr
                          key={index}
                          className="
                            border-t
                            border-slate-700
                            hover:bg-slate-700/40
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
                              item.horizon
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
                              formatPercent(
                                item.precision
                              )
                            }

                            %

                          </td>


                          <td
                            className="
                              px-6
                              py-4
                              text-green-400
                            "
                          >

                            {
                              formatPercent(
                                item.recall
                              )
                            }

                            %

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
                              formatPercent(
                                item.f1_score
                              )
                            }

                            %

                          </td>


                          <td
                            className="
                              px-6
                              py-4
                              text-slate-400
                            "
                          >

                            {
                              formatPercent(
                                item.baseline_f1
                              )
                            }

                            %

                          </td>


                          <td
                            className="
                              px-6
                              py-4
                              text-green-400
                              font-semibold
                            "
                          >

                            +
                            {
                              improvement.toFixed(
                                1
                              )
                            }

                            %

                          </td>


                        </tr>

                      );

                    }
                  )
              }

            </tbody>


          </table>

        </div>

      </div>


      {/* ===================================== */}
      {/* RISK DISTRIBUTION */}
      {/* ===================================== */}

      <div
        className="
          bg-slate-800
          border
          border-slate-700
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

          Current Risk Distribution

        </h2>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >


          {/* HIGH */}

          <div
            className="
              bg-red-500/10
              border
              border-red-500/30
              rounded-xl
              p-5
            "
          >

            <p
              className="
                text-red-400
                font-semibold
              "
            >

              High Risk

            </p>


            <p
              className="
                text-4xl
                font-bold
                text-white
                mt-3
              "
            >

              {
                validation
                  .risk_distribution
                  ?.high || 0
              }

            </p>

          </div>


          {/* MEDIUM */}

          <div
            className="
              bg-orange-500/10
              border
              border-orange-500/30
              rounded-xl
              p-5
            "
          >

            <p
              className="
                text-orange-400
                font-semibold
              "
            >

              Medium Risk

            </p>


            <p
              className="
                text-4xl
                font-bold
                text-white
                mt-3
              "
            >

              {
                validation
                  .risk_distribution
                  ?.medium || 0
              }

            </p>

          </div>


          {/* LOW */}

          <div
            className="
              bg-green-500/10
              border
              border-green-500/30
              rounded-xl
              p-5
            "
          >

            <p
              className="
                text-green-400
                font-semibold
              "
            >

              Low Risk

            </p>


            <p
              className="
                text-4xl
                font-bold
                text-white
                mt-3
              "
            >

              {
                validation
                  .risk_distribution
                  ?.low || 0
              }

            </p>

          </div>


        </div>


      </div>


      {/* ===================================== */}
      {/* MODEL SUMMARY */}
      {/* ===================================== */}

      <div
        className="
          bg-cyan-500/10
          border
          border-cyan-500/30
          rounded-xl
          p-6
        "
      >

        <h2
          className="
            text-lg
            font-bold
            text-cyan-400
          "
        >

          Model Performance Summary

        </h2>


        <p
          className="
            text-slate-300
            mt-3
            leading-7
          "
        >

          The TechNova Sentinel AI model
          demonstrates measurable improvement
          over the baseline prediction model.
          Validation is performed across
          multiple prediction horizons
          including 7, 14 and 21 day
          disease surge forecasts.

        </p>

      </div>


    </div>

  );

}
