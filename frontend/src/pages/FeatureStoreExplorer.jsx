import React, {
  useEffect,
  useState,
} from "react";

import {
  FaDatabase,
  FaSearch,
  FaMapMarkerAlt,
  FaVirus,
  FaSyncAlt,
  FaChartLine,
  FaCloudRain,
  FaTemperatureHigh,
  FaTint,
} from "react-icons/fa";

import {
  LineChart,
  Line,

  AreaChart,
  Area,

  XAxis,
  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

} from "recharts";


import {

  getFeatureStoreData,

  getFeatureDistricts,

  getFeatureDiseases,

} from "../services/api";


// ============================================
// FEATURE STORE EXPLORER
// ============================================

export default function FeatureStoreExplorer() {


  // ==========================================
  // STATES
  // ==========================================

  const [
    districts,
    setDistricts,
  ] = useState([]);


  const [
    diseases,
    setDiseases,
  ] = useState([]);


  const [
    district,
    setDistrict,
  ] = useState("");


  const [
    disease,
    setDisease,
  ] = useState("");


  const [
    features,
    setFeatures,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // LOAD INITIAL DATA
  // ==========================================

  useEffect(
    () => {

      const loadInitialData =
        async () => {

          try {

            setInitialLoading(
              true
            );


            setError(
              ""
            );


            const [

              districtResponse,

              diseaseResponse,

            ] = await Promise.all([

              getFeatureDistricts(),

              getFeatureDiseases(),

            ]);


            const districtData =
              districtResponse?.data || [];


            const diseaseData =
              diseaseResponse?.data || [];


            setDistricts(
              districtData
            );


            setDiseases(
              diseaseData
            );


            if (
              districtData.length > 0
            ) {

              setDistrict(
                districtData[0]
              );

            }


            if (
              diseaseData.length > 0
            ) {

              setDisease(
                diseaseData[0]
              );

            }


            if (
              districtData.length === 0
            ) {

              setError(
                "No districts found in Feature Store."
              );

            }


            if (
              diseaseData.length === 0
            ) {

              setError(
                "No diseases found in Feature Store."
              );

            }

          }


          catch (err) {

            console.error(
              "Feature Store Initial Load Error:",
              err
            );


            setError(
              "Unable to load Feature Store filters."
            );

          }


          finally {

            setInitialLoading(
              false
            );

          }

        };


      loadInitialData();

    },

    []
  );


  // ==========================================
  // LOAD FEATURES
  // ==========================================

  const loadFeatures =
    async () => {


      if (
        !district ||
        !disease
      ) {

        setError(
          "Please select both district and disease."
        );

        return;

      }


      try {

        setLoading(
          true
        );


        setError(
          ""
        );


        const response =
          await getFeatureStoreData(

            district,

            disease,

          );


        const data =
          response?.data || [];


        /*
          Backend returns data
          in descending date order.

          Charts need ascending order.
        */

        const chartData =
          [...data].reverse();


        setFeatures(
          chartData
        );


        if (
          chartData.length === 0
        ) {

          setError(
            `No feature data found for ${district} - ${disease}.`
          );

        }

      }


      catch (err) {

        console.error(
          "Feature Store Load Error:",
          err
        );


        setFeatures(
          []
        );


        setError(

          err?.response?.data?.detail ||

          "Unable to load feature data."

        );

      }


      finally {

        setLoading(
          false
        );

      }

    };


  // ==========================================
  // AUTO LOAD AFTER INITIAL SELECTION
  // ==========================================

  useEffect(
    () => {

      if (
        district &&
        disease &&
        !initialLoading
      ) {

        loadFeatures();

      }

    },

    [
      district,
      disease,
      initialLoading,
    ]
  );


  // ==========================================
  // REFRESH ALL
  // ==========================================

  const refreshFeatures =
    async () => {

      await loadFeatures();

    };


  // ==========================================
  // NUMBER FORMAT
  // ==========================================

  const formatNumber =
    (
      value,
      digits = 2
    ) => {

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        return "-";

      }


      const number =
        Number(
          value
        );


      if (
        Number.isNaN(
          number
        )
      ) {

        return "-";

      }


      return number.toFixed(
        digits
      );

    };


  // ==========================================
  // SUMMARY VALUES
  // ==========================================

  const latestFeature =

    features.length > 0

      ? features[
          features.length - 1
        ]

      : null;


  const totalCases =

    features.reduce(

      (
        total,
        item
      ) =>

        total +

        (
          Number(
            item?.cases
          ) || 0
        ),

      0

    );


  const averageRainfall =

    features.length > 0

      ? (

          features.reduce(

            (
              total,
              item
            ) =>

              total +

              (
                Number(
                  item?.rainfall
                ) || 0
              ),

            0

          )

          /

          features.length

        )

      : 0;


  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [

    "date",

    "cases",

    "rainfall",

    "humidity",

    "temperature",

    "standing_water_index",

    "mosquito_breeding_index",

    "mbi_risk_level",

    "feature_version",

  ];


  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (
    initialLoading
  ) {

    return (

      <div
        className="
          min-h-[400px]
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            text-center
          "
        >

          <FaDatabase
            className="
              text-4xl
              text-cyan-400
              mx-auto
              mb-4
              animate-pulse
            "
          />

          <p
            className="
              text-slate-400
            "
          >

            Loading Feature Store...

          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      className="
        space-y-6
      "
    >


      {/* ==================================== */}
      {/* HEADER */}
      {/* ==================================== */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-cyan-500/10
                border
                border-cyan-500/20
                flex
                items-center
                justify-center
                text-cyan-400
                text-xl
              "
            >

              <FaDatabase />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  lg:text-3xl
                  font-bold
                  text-white
                "
              >

                Feature Store Explorer

              </h1>


              <p
                className="
                  text-slate-400
                  mt-1
                "
              >

                Explore AI engineered disease
                prediction features

              </p>

            </div>

          </div>

        </div>


        <button

          onClick={
            refreshFeatures
          }

          disabled={
            loading
          }

          className="
            flex
            items-center
            justify-center
            gap-2
            px-5
            py-3
            bg-cyan-500
            hover:bg-cyan-400
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-slate-950
            font-bold
            rounded-xl
            transition-all
          "

        >

          <FaSyncAlt

            className={
              loading
                ? "animate-spin"
                : ""
            }

          />


          Refresh Data

        </button>

      </div>


      {/* ==================================== */}
      {/* FILTER PANEL */}
      {/* ==================================== */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            mb-5
          "
        >

          <FaSearch
            className="
              text-cyan-400
            "
          />

          <h2
            className="
              text-lg
              font-bold
              text-white
            "
          >

            Feature Filters

          </h2>

        </div>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >


          {/* DISTRICT */}

          <div>

            <label
              className="
                flex
                items-center
                gap-2
                text-sm
                text-slate-400
                mb-2
              "
            >

              <FaMapMarkerAlt />

              District

            </label>


            <select

              value={
                district
              }

              onChange={
                (
                  event
                ) =>

                  setDistrict(
                    event.target.value
                  )
              }

              className="
                w-full
                bg-slate-950
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "

            >

              {

                districts.length === 0

                  ? (

                    <option value="">

                      No districts available

                    </option>

                  )

                  : (

                    districts.map(
                      (
                        item
                      ) => (

                        <option
                          key={item}
                          value={item}
                        >

                          {item}

                        </option>

                      )
                    )

                  )

              }

            </select>

          </div>


          {/* DISEASE */}

          <div>

            <label
              className="
                flex
                items-center
                gap-2
                text-sm
                text-slate-400
                mb-2
              "
            >

              <FaVirus />

              Disease

            </label>


            <select

              value={
                disease
              }

              onChange={
                (
                  event
                ) =>

                  setDisease(
                    event.target.value
                  )
              }

              className="
                w-full
                bg-slate-950
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "

            >

              {

                diseases.length === 0

                  ? (

                    <option value="">

                      No diseases available

                    </option>

                  )

                  : (

                    diseases.map(
                      (
                        item
                      ) => (

                        <option
                          key={item}
                          value={item}
                        >

                          {item}

                        </option>

                      )
                    )

                  )

              }

            </select>

          </div>


          {/* LOAD BUTTON */}

          <div
            className="
              flex
              items-end
            "
          >

            <button

              onClick={
                loadFeatures
              }

              disabled={
                loading ||
                !district ||
                !disease
              }

              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                bg-slate-800
                hover:bg-slate-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                border
                border-slate-700
                rounded-xl
                text-white
                font-semibold
                transition-all
              "

            >

              <FaSearch />

              {

                loading

                  ? "Loading..."

                  : "Load Features"

              }

            </button>

          </div>

        </div>

      </div>


      {/* ==================================== */}
      {/* ERROR */}
      {/* ==================================== */}

      {

        error

        &&

        (

          <div
            className="
              bg-red-500/10
              border
              border-red-500/30
              rounded-xl
              px-5
              py-4
              text-red-300
            "
          >

            {error}

          </div>

        )

      }


      {/* ==================================== */}
      {/* SUMMARY CARDS */}
      {/* ==================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-5
        "
      >


        <SummaryCard

          title="Feature Records"

          value={
            features.length
          }

          icon={
            <FaDatabase />
          }

        />


        <SummaryCard

          title="Latest Cases"

          value={
            latestFeature

              ? formatNumber(
                  latestFeature.cases,
                  0
                )

              : "-"
          }

          icon={
            <FaChartLine />
          }

        />


        <SummaryCard

          title="Total Cases"

          value={
            formatNumber(
              totalCases,
              0
            )
          }

          icon={
            <FaVirus />
          }

        />


        <SummaryCard

          title="Avg Rainfall"

          value={
            formatNumber(
              averageRainfall
            )
          }

          icon={
            <FaCloudRain />
          }

        />

      </div>


      {/* ==================================== */}
      {/* CHARTS */}
      {/* ==================================== */}

      {

        features.length > 0

        &&

        (

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-6
            "
          >


            {/* CASES */}

            <ChartCard
              title="Disease Cases Trend"
              icon={<FaChartLine />}
            >

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <LineChart
                  data={features}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </ChartCard>


            {/* RAINFALL */}

            <ChartCard
              title="Rainfall Trend"
              icon={<FaCloudRain />}
            >

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <AreaChart
                  data={features}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.15}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </ChartCard>


            {/* TEMPERATURE */}

            <ChartCard
              title="Temperature Trend"
              icon={
                <FaTemperatureHigh />
              }
            >

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <LineChart
                  data={features}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f97316"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </ChartCard>


            {/* HUMIDITY */}

            <ChartCard
              title="Humidity Trend"
              icon={<FaTint />}
            >

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <AreaChart
                  data={features}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.15}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </ChartCard>

          </div>

        )

      }


      {/* ==================================== */}
      {/* FEATURE TABLE */}
      {/* ==================================== */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
        "
      >

        <div
          className="
            p-5
            border-b
            border-slate-800
            flex
            justify-between
            items-center
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
                text-white
              "
            >

              Engineered Feature Data

            </h2>


            <p
              className="
                text-sm
                text-slate-400
                mt-1
              "
            >

              District: {district || "-"}

              {" • "}

              Disease: {disease || "-"}

            </p>

          </div>


          <button

            onClick={
              refreshFeatures
            }

            className="
              text-cyan-400
              hover:text-cyan-300
              text-lg
            "

            title="Refresh"

          >

            <FaSyncAlt

              className={
                loading
                  ? "animate-spin"
                  : ""
              }

            />

          </button>

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

            <thead
              className="
                bg-slate-800
              "
            >

              <tr>

                {

                  columns.map(
                    (
                      column
                    ) => (

                      <th

                        key={column}

                        className="
                          px-4
                          py-4
                          text-left
                          text-slate-400
                          whitespace-nowrap
                          font-medium
                        "

                      >

                        {

                          column

                            .replaceAll(
                              "_",
                              " "
                            )

                            .toUpperCase()

                        }

                      </th>

                    )
                  )

                }

              </tr>

            </thead>


            <tbody>

              {

                features.length > 0

                  ? (

                    features.map(
                      (
                        feature,
                        index
                      ) => (

                        <tr

                          key={
                            feature.id ||
                            index
                          }

                          className="
                            border-t
                            border-slate-800
                            hover:bg-slate-800/50
                            transition-colors
                          "

                        >

                          <td className="px-4 py-4 text-slate-300">

                            {
                              feature.date ||
                              "-"
                            }

                          </td>


                          <td className="px-4 py-4 text-white">

                            {
                              formatNumber(
                                feature.cases,
                                0
                              )
                            }

                          </td>


                          <td className="px-4 py-4 text-slate-300">

                            {
                              formatNumber(
                                feature.rainfall
                              )
                            }

                          </td>


                          <td className="px-4 py-4 text-slate-300">

                            {
                              formatNumber(
                                feature.humidity
                              )
                            }

                          </td>


                          <td className="px-4 py-4 text-slate-300">

                            {
                              formatNumber(
                                feature.temperature
                              )
                            }

                          </td>


                          <td className="px-4 py-4 text-slate-300">

                            {
                              formatNumber(
                                feature.standing_water_index
                              )
                            }

                          </td>


                          <td className="px-4 py-4 text-slate-300">

                            {
                              formatNumber(
                                feature.mosquito_breeding_index
                              )
                            }

                          </td>


                          <td className="px-4 py-4">

                            <span
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-semibold

                                ${
                                  String(
                                    feature.mbi_risk_level || ""
                                  )
                                  .toUpperCase() === "HIGH"

                                    ? "bg-red-500/20 text-red-400"

                                    : String(
                                        feature.mbi_risk_level || ""
                                      )
                                      .toUpperCase() === "MEDIUM"

                                      ? "bg-yellow-500/20 text-yellow-400"

                                      : "bg-green-500/20 text-green-400"
                                }
                              `}
                            >

                              {
                                feature.mbi_risk_level ||
                                "-"
                              }

                            </span>

                          </td>


                          <td className="px-4 py-4 text-cyan-400">

                            {
                              feature.feature_version ||
                              "-"
                            }

                          </td>

                        </tr>

                      )
                    )

                  )

                  : (

                    <tr>

                      <td

                        colSpan={
                          columns.length
                        }

                        className="
                          px-6
                          py-10
                          text-center
                          text-slate-500
                        "

                      >

                        {

                          loading

                            ? "Loading features..."

                            : "No feature records found."

                        }

                      </td>

                    </tr>

                  )

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}


// ============================================
// SUMMARY CARD
// ============================================

function SummaryCard({

  title,

  value,

  icon,

}) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <p
            className="
              text-sm
              text-slate-400
            "
          >

            {title}

          </p>


          <h3
            className="
              text-2xl
              font-bold
              text-white
              mt-2
            "
          >

            {value}

          </h3>

        </div>


        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-cyan-500/10
            border
            border-cyan-500/20
            flex
            items-center
            justify-center
            text-cyan-400
            text-xl
          "
        >

          {icon}

        </div>

      </div>

    </div>

  );

}


// ============================================
// CHART CARD
// ============================================

function ChartCard({

  title,

  icon,

  children,

}) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          mb-5
        "
      >

        <span
          className="
            text-cyan-400
          "
        >

          {icon}

        </span>


        <h2
          className="
            text-lg
            font-bold
            text-white
          "
        >

          {title}

        </h2>

      </div>


      {children}

    </div>

  );

}
