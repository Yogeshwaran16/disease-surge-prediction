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


  useEffect(() => {

    loadValidation();

  }, []);


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
          response?.success &&
          response?.validation
        ) {

          setValidation(
            response.validation
          );

        } else {

          setError(
            "Failed to load validation data"
          );

        }

      }

      catch (err) {

        console.error(
          "Validation Load Error:",
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


  if (loading) {

    return (

      <div className="p-6 text-white">

        Loading Validation Scorecard...

      </div>

    );

  }


  if (error) {

    return (

      <div className="p-6 text-red-400">

        {error}

      </div>

    );

  }


  if (!validation) {

    return (

      <div className="p-6 text-slate-400">

        No validation data available

      </div>

    );

  }


  const {
    dataset_size,
    district_count,
    precision,
    recall,
    f1_score,
    lead_time_validation,
    risk_distribution,
  } = validation;


  return (

    <div className="p-6 space-y-6">


      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold text-white">

          Model Validation Scorecard

        </h1>


        <p className="text-slate-400 mt-2">

          Disease Surge Prediction Model Performance

        </p>

      </div>



      {/* PERFORMANCE CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


        {/* PRECISION */}

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <p className="text-slate-400">

            Precision

          </p>


          <p className="text-4xl font-bold text-cyan-400 mt-3">

            {(precision * 100).toFixed(0)}%

          </p>

        </div>



        {/* RECALL */}

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <p className="text-slate-400">

            Recall

          </p>


          <p className="text-4xl font-bold text-yellow-400 mt-3">

            {(recall * 100).toFixed(0)}%

          </p>

        </div>



        {/* F1 */}

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <p className="text-slate-400">

            F1 Score

          </p>


          <p className="text-4xl font-bold text-green-400 mt-3">

            {(f1_score * 100).toFixed(0)}%

          </p>

        </div>


      </div>



      {/* DATASET INFO */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <p className="text-slate-400">

            Dataset Size

          </p>


          <p className="text-3xl font-bold text-white mt-2">

            {dataset_size.toLocaleString()}

          </p>

        </div>



        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <p className="text-slate-400">

            District Coverage

          </p>


          <p className="text-3xl font-bold text-white mt-2">

            {district_count}

          </p>

        </div>


      </div>



      {/* LEAD TIME VALIDATION */}

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">


        <h2 className="text-xl font-bold text-white mb-5">

          Lead Time Validation

        </h2>


        <div className="overflow-x-auto">


          <table className="w-full text-sm">


            <thead>

              <tr className="border-b border-slate-700 text-slate-400">

                <th className="text-left py-3">

                  Forecast Horizon

                </th>


                <th className="text-left py-3">

                  Precision

                </th>


                <th className="text-left py-3">

                  Recall

                </th>


                <th className="text-left py-3">

                  F1 Score

                </th>


                <th className="text-left py-3">

                  Baseline F1

                </th>

              </tr>

            </thead>



            <tbody>


              {lead_time_validation.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="border-b border-slate-700/50 text-white"
                  >

                    <td className="py-4 font-semibold">

                      {item.horizon}

                    </td>


                    <td>

                      {(item.precision * 100).toFixed(0)}%

                    </td>


                    <td>

                      {(item.recall * 100).toFixed(0)}%

                    </td>


                    <td className="text-green-400 font-bold">

                      {(item.f1_score * 100).toFixed(0)}%

                    </td>


                    <td className="text-slate-400">

                      {(item.baseline_f1 * 100).toFixed(0)}%

                    </td>

                  </tr>

                )
              )}


            </tbody>


          </table>

        </div>


      </div>



      {/* RISK DISTRIBUTION */}

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">


        <h2 className="text-xl font-bold text-white mb-5">

          Current Risk Distribution

        </h2>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


          {/* HIGH */}

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">

            <p className="text-red-300">

              High Risk

            </p>


            <p className="text-3xl font-bold text-red-400 mt-2">

              {risk_distribution.high}

            </p>

          </div>



          {/* MEDIUM */}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">

            <p className="text-yellow-300">

              Medium Risk

            </p>


            <p className="text-3xl font-bold text-yellow-400 mt-2">

              {risk_distribution.medium}

            </p>

          </div>



          {/* LOW */}

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">

            <p className="text-green-300">

              Low Risk

            </p>


            <p className="text-3xl font-bold text-green-400 mt-2">

              {risk_distribution.low}

            </p>

          </div>


        </div>


      </div>


    </div>

  );

}
