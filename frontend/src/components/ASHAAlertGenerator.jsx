import React, {
  useState,
} from "react";

import {
  FaBell,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync,
} from "react-icons/fa";

import {
  getDistrictAlert,
} from "../services/api";


export default function ASHAAlertGenerator() {

  const [
    district,
    setDistrict,
  ] = useState("Chennai");


  const [
    alert,
    setAlert,
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
  // NOTIFY DASHBOARD
  // ============================================

  const notifyAlertUpdate = () => {

    window.dispatchEvent(
      new Event(
        "technova-alert-updated"
      )
    );

  };


  // ============================================
  // GENERATE ALERT
  // ============================================

  const generateAlert = async () => {

    try {

      setLoading(true);

      setError("");

      setAlert(null);


      const response =
        await getDistrictAlert(
          district.trim()
        );


      console.log(
        "District Alert Response:",
        response
      );


      setAlert(
        response
      );


      // ============================================
      // SAVE ALERT TO HISTORY
      // ============================================

     if (
  response?.success === true ||
  response?.success ===
true
) {

        const newHistoryItem = {

          id:
            Date.now(),

          district:
            response.district ||
            district,

          disease:
            response.disease ||
            "Unknown Disease",

          alert_level:
            response.alert_level ||
            "LOW",

          alert_status:
            "NEW",

          message:
            response.message ||
            "No message available",

          recommended_actions:
            response.recommended_actions ||
            [],

          generated_at:
            new Date()
              .toLocaleString(),

        };


        const savedHistory =
          localStorage.getItem(
            "technova_alert_history"
          );


        let history = [];


        try {

          history =
            savedHistory
              ? JSON.parse(
                  savedHistory
                )
              : [];

        }

        catch (
          parseError
        ) {

          console.error(
            "History Parse Error:",
            parseError
          );

          history = [];

        }


        // Ensure history is array

        if (
          !Array.isArray(
            history
          )
        ) {

          history = [];

        }


        // Add new alert to top

        history.unshift(
          newHistoryItem
        );


        // Keep only latest 50 alerts

        const updatedHistory =
          history.slice(
            0,
            50
          );


        localStorage.setItem(
          "technova_alert_history",
          JSON.stringify(
            updatedHistory
          )
        );


        // ============================================
        // DASHBOARD INSTANT UPDATE
        // ============================================

        notifyAlertUpdate();


        console.log(
          "Alert saved to history and Dashboard updated"
        );

      }

    }

    catch (err) {

      console.error(
        "Alert Error:",
        err
      );


      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to generate district alert"
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ============================================
  // ALERT STYLE
  // ============================================

  const getAlertStyle = (
    level
  ) => {

    switch (
      level?.toUpperCase()
    ) {

      case "CRITICAL":

        return `
          bg-red-600/20
          border-red-500
          text-red-400
        `;


      case "HIGH":

        return `
          bg-orange-600/20
          border-orange-500
          text-orange-400
        `;


      case "MEDIUM":

        return `
          bg-yellow-600/20
          border-yellow-500
          text-yellow-400
        `;


      case "LOW":

        return `
          bg-green-600/20
          border-green-500
          text-green-400
        `;


      default:

        return `
          bg-slate-700
          border-slate-600
          text-slate-300
        `;

    }

  };


  return (

    <div className="p-6 space-y-6">


      {/* HEADER */}

      <div>

        <div className="flex items-center gap-3">

          <FaBell className="text-3xl text-cyan-400" />


          <div>

            <h1 className="text-3xl font-bold text-white">

              ASHA Alert Generator

            </h1>


            <p className="text-slate-400 mt-1">

              Generate disease outbreak alerts
              for district health workers

            </p>

          </div>

        </div>

      </div>


      {/* ALERT FORM */}

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
            text-lg
            font-semibold
            text-white
            mb-4
          "
        >

          Select District

        </h2>


        <div
          className="
            flex
            flex-col
            md:flex-row
            gap-4
          "
        >

          <div
            className="
              flex-1
              relative
            "
          >

            <FaMapMarkerAlt
              className="
                absolute
                left-4
                top-4
                text-cyan-400
              "
            />


            <input
              type="text"
              value={district}

              onChange={
                (e) =>
                  setDistrict(
                    e.target.value
                  )
              }

              placeholder="Enter District"

              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                pl-11
                pr-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            />

          </div>


          <button
            onClick={generateAlert}

            disabled={
              loading ||
              !district.trim()
            }

            className="
              bg-cyan-600
              hover:bg-cyan-500
              disabled:bg-slate-600
              disabled:cursor-not-allowed
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition
            "
          >

            {
              loading

                ? (

                  <>

                    <FaSync
                      className="
                        animate-spin
                      "
                    />

                    Generating...

                  </>

                )

                : (

                  <>

                    <FaBell />

                    Generate Alert

                  </>

                )
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
              p-5
              text-red-400
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <FaExclamationTriangle />

              <span>

                {error}

              </span>

            </div>

          </div>

        )
      }


      {/* ALERT RESULT */}

      {
        alert && (

          <div
            className="
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              overflow-hidden
            "
          >

            {/* RESULT HEADER */}

            <div
              className="
                p-6
                border-b
                border-slate-700
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
                    text-2xl
                    font-bold
                    text-white
                  "
                >

                  District Alert

                </h2>


                <p
                  className="
                    text-slate-400
                    mt-1
                  "
                >

                  {alert.district}

                  {" • "}

                  {alert.disease}

                </p>

              </div>


              <div
                className={`
                  px-4
                  py-2
                  rounded-lg
                  border
                  font-bold
                  ${getAlertStyle(
                    alert.alert_level
                  )}
                `}
              >

                {alert.alert_level}

                {" RISK"}

              </div>

            </div>


            {/* ALERT MESSAGE */}

            <div className="p-6">

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-700
                  rounded-xl
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >

                  <FaExclamationTriangle
                    className="
                      text-2xl
                      text-orange-400
                      mt-1
                    "
                  />


                  <div>

                    <h3
                      className="
                        font-semibold
                        text-white
                        mb-2
                      "
                    >

                      Alert Message

                    </h3>


                    <p
                      className="
                        text-slate-300
                        leading-relaxed
                      "
                    >

                      {alert.message}

                    </p>

                  </div>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="mt-6">

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-white
                    mb-4
                  "
                >

                  Recommended Actions

                </h3>


                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                  "
                >

                  {
                    alert.recommended_actions?.map(
                      (
                        action,
                        index
                      ) => (

                        <div
                          key={index}

                          className="
                            bg-slate-900
                            border
                            border-slate-700
                            hover:border-cyan-500/50
                            rounded-lg
                            p-4
                            flex
                            items-center
                            gap-3
                            transition
                          "
                        >

                          <FaCheckCircle
                            className="
                              text-green-400
                              text-xl
                              flex-shrink-0
                            "
                          />


                          <span className="text-slate-300">

                            {action}

                          </span>

                        </div>

                      )
                    )
                  }

                </div>

              </div>


              {/* STATUS */}

              <div
                className="
                  mt-6
                  pt-5
                  border-t
                  border-slate-700
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-slate-400
                "
              >

                <div
                  className="
                    w-2
                    h-2
                    bg-green-400
                    rounded-full
                  "
                />


                Alert Status:


                <span
                  className="
                    text-green-400
                    font-semibold
                  "
                >

                  {alert.status}

                </span>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}
