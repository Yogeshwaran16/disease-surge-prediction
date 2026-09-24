import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  FaBrain,
  FaSearch,
  FaLightbulb,
  FaArrowUp,
  FaChartBar,
} from "react-icons/fa";

import {
  getDistrictShap,
} from "../services/api";


// ============================================
// FEATURE NAME FORMATTER
// ============================================

const formatFeatureName = (
  feature
) => {

  const names = {

    total_calls:
      "Total Health Calls",

    fever_calls:
      "Fever-Related Calls",

    paracetamol_strips_sold:
      "Paracetamol Sales",

    aedes_larval_index:
      "Aedes Larval Index",

    rainfall_mm:
      "Rainfall",

    occupancy_rate_pct:
      "Hospital Occupancy",

    total_opd:
      "Total OPD Visits",

    max_temperature_c:
      "Maximum Temperature",

    fever_opd:
      "Fever OPD Visits",

    dengue_diagnostic_kits:
      "Dengue Diagnostic Kits",

  };


  return (
    names[feature] ||
    String(feature)
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  );

};


// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({
  active,
  payload,
}) => {

  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }


  const item =
    payload[0].payload;


  return (

    <div
      style={{
        background:
          "#0f172a",
        border:
          "1px solid #334155",
        borderRadius:
          "12px",
        padding:
          "14px",
        color:
          "#ffffff",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >

      <p
        style={{
          margin:
            "0 0 8px",
          fontWeight:
            "bold",
        }}
      >
        {
          formatFeatureName(
            item.feature
          )
        }
      </p>

      <p
        style={{
          margin: 0,
          color:
            "#a78bfa",
        }}
      >
        Impact:{" "}

        <strong>
          {
            Number(
              item.impact
            ).toFixed(4)
          }
        </strong>
      </p>

    </div>

  );

};


// ============================================
// MAIN COMPONENT
// ============================================

const ShapFeatureChart = ({
  selectedDistrict = "Chennai",
}) => {

  const [
    shapData,
    setShapData,
  ] = useState([]);

  const [
    district,
    setDistrict,
  ] = useState(
    selectedDistrict
  );

  const [
    activeDistrict,
    setActiveDistrict,
  ] = useState(
    selectedDistrict
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // LOAD SHAP DATA
  // ==========================================

  useEffect(() => {

    if (
      selectedDistrict
    ) {

      setDistrict(
        selectedDistrict
      );

      loadShapData(
        selectedDistrict
      );

    }

  }, [
    selectedDistrict,
  ]);


  const loadShapData =
    async (
      districtName
    ) => {

      try {

        setLoading(true);

        setError("");


        const response =
          await getDistrictShap(
            districtName
          );


        if (

          response?.success &&

          Array.isArray(
            response?.data?.features
          )

        ) {

          const sorted = [

            ...response
              .data
              .features,

          ]
            .map(
              (item) => ({

                ...item,

                impact:
                  Number(
                    item.impact
                  ) || 0,

              })
            )
            .sort(
              (a, b) =>
                b.impact -
                a.impact
            );


          const returnedDistrict =

            response?.data
              ?.district ||

            districtName;


          setDistrict(
            returnedDistrict
          );

          setActiveDistrict(
            returnedDistrict
          );

          setShapData(
            sorted
          );

        }

        else {

          setShapData([]);

          setError(
            "No SHAP data available for this district."
          );

        }

      }

      catch (err) {

        console.error(
          "SHAP API Error:",
          err
        );


        setError(

          `Unable to load SHAP data for ${districtName}.`

        );


        setShapData([]);

      }

      finally {

        setLoading(false);

      }

    };


  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch =
    () => {

      const cleanDistrict =

        district
          ?.trim();


      if (
        cleanDistrict
      ) {

        loadShapData(
          cleanDistrict
        );

      }

    };


  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalImpact =
    useMemo(
      () =>
        shapData.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.impact,
          0
        ),
      [
        shapData,
      ]
    );


  const topFeature =
    shapData?.[0];


  const topThree =
    shapData.slice(
      0,
      3
    );


  const strongestImpact =
    topFeature?.impact ||
    0;


  return (

    <div
      style={{
        background:
          "#0f172a",

        color:
          "#ffffff",

        padding:
          "28px",

        borderRadius:
          "18px",

        border:
          "1px solid #1e293b",

        boxShadow:
          "0 15px 35px rgba(0,0,0,0.3)",

      }}
    >


      {/* ==================================== */}
      {/* HEADER */}
      {/* ==================================== */}

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          flexWrap:
            "wrap",

          gap:
            "15px",

          marginBottom:
            "25px",

        }}
      >

        <div>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",

            }}
          >

            <FaBrain
              size={28}
              color="#a78bfa"
            />


            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "24px",
                }}
              >
                SHAP Feature Breakdown
              </h2>


              <p
                style={{
                  margin:
                    "5px 0 0",

                  color:
                    "#94a3b8",

                  fontSize:
                    "14px",
                }}
              >
                AI-powered feature importance analysis
              </p>

            </div>

          </div>

        </div>


        {/* DISTRICT BADGE */}

        <div
          style={{
            background:
              "#1e293b",

            border:
              "1px solid #334155",

            padding:
              "10px 16px",

            borderRadius:
              "10px",

            color:
              "#a78bfa",

            fontWeight:
              "bold",
          }}
        >

          📍 {activeDistrict}

        </div>

      </div>


      {/* ==================================== */}
      {/* SEARCH */}
      {/* ==================================== */}

      <div
        style={{
          display:
            "flex",

          gap:
            "12px",

          marginBottom:
            "25px",

        }}
      >

        <input
          type="text"

          value={
            district
          }

          onChange={
            (e) =>
              setDistrict(
                e.target.value
              )
          }

          placeholder=
            "Enter district name..."

          onKeyDown={
            (e) => {

              if (
                e.key ===
                "Enter"
              ) {

                handleSearch();

              }

            }
          }

          style={{
            flex: 1,

            padding:
              "14px 18px",

            background:
              "#1e293b",

            color:
              "#ffffff",

            border:
              "1px solid #334155",

            borderRadius:
              "10px",

            outline:
              "none",

            fontSize:
              "15px",

          }}
        />


        <button

          onClick={
            handleSearch
          }

          disabled={
            loading
          }

          style={{
            background:
              loading
                ? "#475569"
                : "#7c3aed",

            color:
              "#ffffff",

            border:
              "none",

            padding:
              "14px 22px",

            borderRadius:
              "10px",

            cursor:
              loading
                ? "not-allowed"
                : "pointer",

            fontSize:
              "16px",

          }}

        >

          <FaSearch />

        </button>

      </div>


      {/* ==================================== */}
      {/* ERROR */}
      {/* ==================================== */}

      {error && (

        <div
          style={{
            background:
              "#450a0a",

            border:
              "1px solid #ef4444",

            color:
              "#fecaca",

            padding:
              "14px",

            borderRadius:
              "10px",

            marginBottom:
              "20px",

          }}
        >

          {error}

        </div>

      )}


      {/* ==================================== */}
      {/* LOADING */}
      {/* ==================================== */}

      {loading ? (

        <div
          style={{
            height:
              "350px",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            color:
              "#a78bfa",

            fontSize:
              "18px",

          }}
        >

          🧠 Analyzing feature importance...

        </div>

      ) : (

        <>


          {/* ================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================= */}

          {shapData.length >
            0 && (

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",

                gap:
                  "15px",

                marginBottom:
                  "25px",

              }}
            >


              {/* TOTAL FEATURES */}

              <div
                style={{
                  background:
                    "#1e293b",

                  padding:
                    "18px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #334155",

                }}
              >

                <FaChartBar
                  color="#38bdf8"
                />


                <p
                  style={{
                    color:
                      "#94a3b8",

                    margin:
                      "10px 0 5px",

                  }}
                >
                  Features Analyzed
                </p>


                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {
                    shapData.length
                  }
                </h2>

              </div>


              {/* STRONGEST DRIVER */}

              <div
                style={{
                  background:
                    "#1e293b",

                  padding:
                    "18px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #334155",

                }}
              >

                <FaArrowUp
                  color="#f97316"
                />


                <p
                  style={{
                    color:
                      "#94a3b8",

                    margin:
                      "10px 0 5px",

                  }}
                >
                  Strongest Driver
                </p>


                <strong
                  style={{
                    fontSize:
                      "16px",

                    color:
                      "#ffffff",
                  }}
                >
                  {
                    formatFeatureName(
                      topFeature
                        ?.feature
                    )
                  }
                </strong>

              </div>


              {/* IMPACT */}

              <div
                style={{
                  background:
                    "#1e293b",

                  padding:
                    "18px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #334155",

                }}
              >

                <FaBrain
                  color="#a78bfa"
                />


                <p
                  style={{
                    color:
                      "#94a3b8",

                    margin:
                      "10px 0 5px",

                  }}
                >
                  Strongest Impact
                </p>


                <h2
                  style={{
                    margin: 0,
                    color:
                      "#a78bfa",
                  }}
                >
                  {
                    strongestImpact
                      .toFixed(4)
                  }
                </h2>

              </div>


              {/* TOTAL IMPACT */}

              <div
                style={{
                  background:
                    "#1e293b",

                  padding:
                    "18px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #334155",

                }}
              >

                <FaLightbulb
                  color="#facc15"
                />


                <p
                  style={{
                    color:
                      "#94a3b8",

                    margin:
                      "10px 0 5px",

                  }}
                >
                  Total Impact
                </p>


                <h2
                  style={{
                    margin: 0,
                    color:
                      "#facc15",
                  }}
                >
                  {
                    totalImpact
                      .toFixed(4)
                  }
                </h2>

              </div>

            </div>

          )}


          {/* ================================= */}
          {/* CHART */}
          {/* ================================= */}

          <div
            style={{
              background:
                "#111827",

              border:
                "1px solid #1e293b",

              borderRadius:
                "14px",

              padding:
                "20px",

            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              Feature Impact Ranking
            </h3>


            <p
              style={{
                color:
                  "#94a3b8",

                fontSize:
                  "14px",

                marginBottom:
                  "20px",
              }}
            >
              Features ranked by their contribution to the disease surge prediction.
            </p>


            <div
              style={{
                width:
                  "100%",

                height:
                  480,
              }}
            >

              {shapData.length >
              0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart

                    data={
                      shapData
                    }

                    layout=
                      "vertical"

                    margin={{
                      top: 10,
                      right: 40,
                      left: 40,
                      bottom: 10,
                    }}

                  >

                    <CartesianGrid
                      strokeDasharray=
                        "3 3"

                      stroke=
                        "#334155"
                    />


                    <XAxis

                      type=
                        "number"

                      stroke=
                        "#94a3b8"

                      tickFormatter={
                        (value) =>
                          Number(
                            value
                          ).toFixed(
                            2
                          )
                      }

                    />


                    <YAxis

                      type=
                        "category"

                      dataKey=
                        "feature"

                      width={
                        190
                      }

                      stroke=
                        "#cbd5e1"

                      tickFormatter={
                        (
                          value
                        ) =>
                          formatFeatureName(
                            value
                          )
                      }

                    />


                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />


                    <Bar

                      dataKey=
                        "impact"

                      radius={[
                        0,
                        8,
                        8,
                        0,
                      ]}

                    >

                      {shapData.map(
                        (
                          entry,
                          index
                        ) => (

                          <Cell

                            key={
                              index
                            }

                            fill={
                              index ===
                              0

                                ? "#ef4444"

                                : index ===
                                  1

                                ? "#f97316"

                                : index ===
                                  2

                                ? "#eab308"

                                : "#7c3aed"
                            }

                          />

                        )
                      )}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div
                  style={{
                    height:
                      "100%",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    color:
                      "#64748b",

                  }}
                >
                  No SHAP data available
                </div>

              )}

            </div>

          </div>


          {/* ================================= */}
          {/* TOP DRIVERS */}
          {/* ================================= */}

          {topThree.length >
            0 && (

            <div
              style={{
                marginTop:
                  "25px",

                background:
                  "#1e293b",

                padding:
                  "22px",

                borderRadius:
                  "14px",

                border:
                  "1px solid #334155",

              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                🔥 Top Risk Drivers
              </h3>


              {topThree.map(
                (
                  item,
                  index
                ) => {

                  const percentage =

                    totalImpact > 0

                      ? (
                          item.impact /
                          totalImpact
                        ) *
                        100

                      : 0;


                  return (

                    <div

                      key={
                        item.feature
                      }

                      style={{
                        marginBottom:
                          index ===
                          topThree.length -
                            1

                            ? 0

                            : "18px",
                      }}

                    >

                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          marginBottom:
                            "7px",

                        }}
                      >

                        <span>

                          #{index + 1}{" "}

                          {
                            formatFeatureName(
                              item.feature
                            )
                          }

                        </span>


                        <strong
                          style={{
                            color:
                              "#a78bfa",
                          }}
                        >
                          {
                            percentage.toFixed(
                              1
                            )
                          }
                          %
                        </strong>

                      </div>


                      <div
                        style={{
                          height:
                            "8px",

                          background:
                            "#334155",

                          borderRadius:
                            "10px",

                          overflow:
                            "hidden",

                        }}
                      >

                        <div
                          style={{
                            width:
                              `${percentage}%`,

                            height:
                              "100%",

                            background:
                              "#7c3aed",

                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}


          {/* ================================= */}
          {/* AI EXPLANATION */}
          {/* ================================= */}

          {shapData.length >
            0 && (

            <div
              style={{
                marginTop:
                  "25px",

                background:
                  "linear-gradient(135deg, #064e3b, #14532d)",

                border:
                  "1px solid #22c55e",

                padding:
                  "24px",

                borderRadius:
                  "14px",

              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "10px",

                  marginBottom:
                    "12px",

                }}
              >

                <FaLightbulb
                  color="#facc15"
                  size={22}
                />


                <strong
                  style={{
                    fontSize:
                      "18px",
                  }}
                >
                  AI Explanation
                </strong>

              </div>


              <p
                style={{
                  margin: 0,

                  lineHeight:
                    1.7,

                  color:
                    "#dcfce7",
                }}
              >

                The disease surge prediction
                for{" "}

                <strong>
                  {activeDistrict}
                </strong>

                {" "}is primarily influenced by{" "}

                <strong>
                  {
                    formatFeatureName(
                      topThree?.[0]
                        ?.feature
                    )
                  }
                </strong>

                {topThree?.[1] &&
                  (
                    <>
                      {", "}

                      <strong>
                        {
                          formatFeatureName(
                            topThree?.[1]
                              ?.feature
                          )
                        }
                      </strong>
                    </>
                  )}

                {topThree?.[2] &&
                  (
                    <>
                      {" and "}

                      <strong>
                        {
                          formatFeatureName(
                            topThree?.[2]
                              ?.feature
                          )
                        }
                      </strong>
                    </>
                  )}

                . These factors have the
                highest contribution to
                the AI model's disease
                surge prediction.

              </p>

            </div>

          )}

        </>

      )}

    </div>

  );

};


export default ShapFeatureChart;
