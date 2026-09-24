import React, {
  useState,
} from "react";

import {
  generateRecommendations,
} from "../services/recommendationService";

import "../styles/recommendations.css";


const Recommendations = () => {

  const [
    formData,
    setFormData,
  ] = useState({

    district: "Chennai",

    disease: "Dengue",

    risk_level: "HIGH",

    surge_probability: 0.87,

    confidence_score: 0.91,

    expected_cases_2w: 145,

  });


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


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData({

      ...formData,

      [name]:

        [
          "surge_probability",
          "confidence_score",
          "expected_cases_2w",
        ].includes(name)

          ? Number(value)

          : value,

    });

  };


  const handleSubmit =
    async (event) => {

      event.preventDefault();


      try {

        setLoading(true);

        setError("");

        setResult(null);


        const response =
          await generateRecommendations(
            formData
          );


        if (!response.success) {

          throw new Error(
            response.message ||
            "Failed to generate recommendations"
          );

        }


        setResult(
          response.data
        );


      } catch (err) {

        console.error(
          "Recommendation Page Error:",
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


  const getPriorityClass =
    (priority) => {

      switch (
        String(
          priority || ""
        ).toUpperCase()
      ) {

        case "CRITICAL":
          return "priority-critical";

        case "HIGH":
          return "priority-high";

        case "MEDIUM":
          return "priority-medium";

        case "LOW":
          return "priority-low";

        default:
          return "priority-low";

      }

    };


  return (

    <div className="recommendations-container">


      <div className="recommendations-header">

        <div>

          <h1>
            AI Health Recommendations
          </h1>

          <p>
            Generate preventive actions
            based on disease surge risk
          </p>

        </div>

      </div>


      {/* ===================================
          INPUT FORM
      =================================== */}

      <div className="recommendation-form-card">

        <h2>
          Prediction Details
        </h2>


        <form
          onSubmit={handleSubmit}
        >


          <div className="form-grid">


            <div className="form-group">

              <label>
                District
              </label>

              <input

                type="text"

                name="district"

                value={
                  formData.district
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            <div className="form-group">

              <label>
                Disease
              </label>

              <input

                type="text"

                name="disease"

                value={
                  formData.disease
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            <div className="form-group">

              <label>
                Risk Level
              </label>

              <select

                name="risk_level"

                value={
                  formData.risk_level
                }

                onChange={
                  handleChange
                }

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


            <div className="form-group">

              <label>
                Surge Probability
              </label>

              <input

                type="number"

                name="surge_probability"

                min="0"

                max="1"

                step="0.01"

                value={
                  formData.surge_probability
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            <div className="form-group">

              <label>
                Confidence Score
              </label>

              <input

                type="number"

                name="confidence_score"

                min="0"

                max="1"

                step="0.01"

                value={
                  formData.confidence_score
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            <div className="form-group">

              <label>
                Expected Cases (2 Weeks)
              </label>

              <input

                type="number"

                name="expected_cases_2w"

                min="0"

                value={
                  formData.expected_cases_2w
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


          </div>


          <button

            type="submit"

            className="generate-btn"

            disabled={loading}

          >

            {
              loading

                ? "Generating..."

                : "Generate AI Recommendations"
            }

          </button>


        </form>

      </div>


      {/* ===================================
          ERROR
      =================================== */}

      {

        error && (

          <div className="recommendation-error">

            {error}

          </div>

        )

      }


      {/* ===================================
          RESULT
      =================================== */}

      {

        result && (

          <>


            {/* SUMMARY */}

            <div className="recommendation-summary">

              <div>

                <span>
                  District
                </span>

                <h3>
                  {result.district}
                </h3>

              </div>


              <div>

                <span>
                  Disease
                </span>

                <h3>
                  {result.disease}
                </h3>

              </div>


              <div>

                <span>
                  Risk Level
                </span>

                <h3>
                  {result.risk_level}
                </h3>

              </div>


              <div>

                <span>
                  Surge Probability
                </span>

                <h3>

                  {

                    (
                      result.surge_probability *
                      100
                    ).toFixed(1)

                  }

                  %

                </h3>

              </div>


              <div>

                <span>
                  Expected Cases
                </span>

                <h3>
                  {
                    result.expected_cases_2w
                  }
                </h3>

              </div>


            </div>


            {/* EMERGENCY */}

            {

              result.emergency_escalation && (

                <div className="emergency-alert">

                  🚨 EMERGENCY ESCALATION REQUIRED

                </div>

              )

            }


            {/* RECOMMENDATIONS */}

            <div className="recommendations-list-card">

              <h2>
                Recommended Actions
              </h2>


              <div className="recommendations-grid">

                {

                  result.recommendations.map(

                    (
                      item,
                      index
                    ) => (

                      <div

                        key={index}

                        className="recommendation-item"

                      >


                        <div className="recommendation-item-header">

                          <h3>

                            {
                              item.category
                            }

                          </h3>


                          <span

                            className={
                              `priority-badge ${getPriorityClass(
                                item.priority
                              )}`
                            }

                          >

                            {
                              item.priority
                            }

                          </span>

                        </div>


                        <p>

                          {
                            item.action
                          }

                        </p>


                        <div className="timeline">

                          ⏱ Timeline:

                          {" "}

                          {
                            item.timeline
                          }

                        </div>


                      </div>

                    )

                  )

                }

              </div>


            </div>


          </>

        )

      }


    </div>

  );

};


export default Recommendations;
