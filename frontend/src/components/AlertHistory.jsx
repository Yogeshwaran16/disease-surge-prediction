import React, {
  useEffect,
  useState,
} from "react";

import {
  FaHistory,
  FaTrash,
  FaMapMarkerAlt,
  FaBell,
  FaCheckCircle,
  FaEye,
  FaClock,
} from "react-icons/fa";


export default function AlertHistory() {

  const [
    history,
    setHistory,
  ] = useState([]);


  // ============================================
  // LOAD HISTORY
  // ============================================

  useEffect(() => {

    loadHistory();

  }, []);


  const loadHistory = () => {

    const savedHistory =
      localStorage.getItem(
        "technova_alert_history"
      );


    if (!savedHistory) {

      setHistory([]);

      return;

    }


    try {

      const parsedHistory =
        JSON.parse(savedHistory);


      const updatedHistory =
        parsedHistory.map(
          (item) => ({

            ...item,

            alert_status:
              item.alert_status ||
              "NEW",

          })
        );


      setHistory(
        updatedHistory
      );


      localStorage.setItem(
        "technova_alert_history",
        JSON.stringify(
          updatedHistory
        )
      );

    }

    catch (error) {

      console.error(
        "History Load Error:",
        error
      );

      setHistory([]);

    }

  };


  // ============================================
  // DISPATCH DASHBOARD UPDATE EVENT
  // ============================================

  const notifyAlertUpdate = () => {

    window.dispatchEvent(
      new Event(
        "technova-alert-updated"
      )
    );

  };


  // ============================================
  // UPDATE ALERT STATUS
  // ============================================

  const updateAlertStatus =
    (id, newStatus) => {

      const updatedHistory =
        history.map(
          (item) => {

            if (
              item.id === id
            ) {

              return {

                ...item,

                alert_status:
                  newStatus,

                status_updated_at:
                  new Date()
                    .toLocaleString(),

              };

            }

            return item;

          }
        );


      setHistory(
        updatedHistory
      );


      localStorage.setItem(
        "technova_alert_history",
        JSON.stringify(
          updatedHistory
        )
      );


      // DASHBOARD INSTANT UPDATE

      notifyAlertUpdate();

    };


  // ============================================
  // DELETE SINGLE ALERT
  // ============================================

  const deleteAlert =
    (id) => {

      const updatedHistory =
        history.filter(
          (item) =>
            item.id !== id
        );


      setHistory(
        updatedHistory
      );


      localStorage.setItem(
        "technova_alert_history",
        JSON.stringify(
          updatedHistory
        )
      );


      // DASHBOARD INSTANT UPDATE

      notifyAlertUpdate();

    };


  // ============================================
  // CLEAR ALL HISTORY
  // ============================================

  const clearHistory = () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to clear all alert history?"
      );


    if (!confirmed) {

      return;

    }


    setHistory([]);


    localStorage.removeItem(
      "technova_alert_history"
    );


    // DASHBOARD INSTANT UPDATE

    notifyAlertUpdate();

  };


  // ============================================
  // RISK STYLE
  // ============================================

  const getRiskStyle =
    (risk) => {

      switch (
        String(
          risk || ""
        ).toUpperCase()
      ) {

        case "CRITICAL":

          return `
            bg-red-600/20
            text-red-400
            border-red-500/30
          `;


        case "HIGH":

          return `
            bg-orange-500/20
            text-orange-400
            border-orange-500/30
          `;


        case "MEDIUM":

          return `
            bg-yellow-500/20
            text-yellow-400
            border-yellow-500/30
          `;


        case "LOW":

          return `
            bg-green-500/20
            text-green-400
            border-green-500/30
          `;


        default:

          return `
            bg-slate-700
            text-slate-300
            border-slate-600
          `;

      }

    };


  // ============================================
  // STATUS STYLE
  // ============================================

  const getStatusStyle =
    (status) => {

      switch (
        String(
          status || "NEW"
        ).toUpperCase()
      ) {

        case "ACKNOWLEDGED":

          return `
            bg-blue-500/20
            text-blue-400
            border-blue-500/30
          `;


        case "RESOLVED":

          return `
            bg-green-500/20
            text-green-400
            border-green-500/30
          `;


        case "NEW":

        default:

          return `
            bg-yellow-500/20
            text-yellow-400
            border-yellow-500/30
          `;

      }

    };


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

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <FaHistory
            className="
              text-cyan-400
              text-3xl
            "
          />


          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              Alert History
            </h1>


            <p
              className="
                text-slate-400
                mt-1
              "
            >
              Manage previously generated
              district disease alerts
            </p>

          </div>

        </div>


        {
          history.length > 0 && (

            <button
              onClick={clearHistory}
              className="
                bg-red-500/10
                hover:bg-red-500/20
                border
                border-red-500/30
                text-red-400
                px-4
                py-2
                rounded-lg
                font-semibold
                transition
                flex
                items-center
                gap-2
              "
            >

              <FaTrash />

              Clear History

            </button>

          )
        }

      </div>


      {/* SUMMARY */}

      {
        history.length > 0 && (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >

            <div className="
              bg-yellow-500/10
              border
              border-yellow-500/20
              rounded-xl
              p-4
            ">

              <p className="text-yellow-400 text-sm">
                New Alerts
              </p>

              <h2 className="
                text-2xl
                font-bold
                text-white
                mt-2
              ">

                {
                  history.filter(
                    (item) =>
                      item.alert_status === "NEW"
                  ).length
                }

              </h2>

            </div>


            <div className="
              bg-blue-500/10
              border
              border-blue-500/20
              rounded-xl
              p-4
            ">

              <p className="text-blue-400 text-sm">
                Acknowledged
              </p>

              <h2 className="
                text-2xl
                font-bold
                text-white
                mt-2
              ">

                {
                  history.filter(
                    (item) =>
                      item.alert_status ===
                      "ACKNOWLEDGED"
                  ).length
                }

              </h2>

            </div>


            <div className="
              bg-green-500/10
              border
              border-green-500/20
              rounded-xl
              p-4
            ">

              <p className="text-green-400 text-sm">
                Resolved
              </p>

              <h2 className="
                text-2xl
                font-bold
                text-white
                mt-2
              ">

                {
                  history.filter(
                    (item) =>
                      item.alert_status ===
                      "RESOLVED"
                  ).length
                }

              </h2>

            </div>

          </div>

        )
      }


      {/* EMPTY */}

      {
        history.length === 0 && (

          <div className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-10
            text-center
          ">

            <FaBell
              className="
                text-slate-500
                text-4xl
                mx-auto
                mb-4
              "
            />

            <h2 className="
              text-xl
              font-semibold
              text-white
            ">
              No Alert History
            </h2>

            <p className="
              text-slate-400
              mt-2
            ">
              Generate district alerts to see them here.
            </p>

          </div>

        )
      }


      {/* HISTORY LIST */}

      {
        history.length > 0 && (

          <div className="space-y-4">

            {
              history.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      bg-slate-800
                      border
                      border-slate-700
                      hover:border-cyan-500/40
                      rounded-xl
                      p-5
                      transition
                    "
                  >

                    <div className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-5
                    ">

                      {/* ALERT INFO */}

                      <div className="flex-1">

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        ">

                          <FaMapMarkerAlt
                            className="text-cyan-400"
                          />

                          <h3 className="
                            text-lg
                            font-semibold
                            text-white
                          ">
                            {item.district}
                          </h3>


                          <span
                            className={`
                              px-3 py-1 rounded-lg border
                              text-xs font-bold
                              ${getRiskStyle(
                                item.alert_level
                              )}
                            `}
                          >
                            {item.alert_level}
                          </span>


                          <span
                            className={`
                              px-3 py-1 rounded-lg border
                              text-xs font-bold
                              ${getStatusStyle(
                                item.alert_status
                              )}
                            `}
                          >
                            {
                              item.alert_status ||
                              "NEW"
                            }
                          </span>

                        </div>


                        <p className="
                          text-slate-400
                          text-sm
                          mt-3
                        ">

                          Disease:{" "}

                          <span className="text-white">
                            {item.disease}
                          </span>

                        </p>


                        <p className="
                          text-slate-400
                          text-sm
                          mt-2
                        ">
                          {item.message}
                        </p>


                        <p className="
                          text-xs
                          text-slate-500
                          mt-3
                        ">

                          Generated:{" "}

                          {item.generated_at}

                        </p>


                        {
                          item.status_updated_at && (

                            <p className="
                              text-xs
                              text-slate-500
                              mt-1
                            ">

                              Status Updated:{" "}

                              {
                                item.status_updated_at
                              }

                            </p>

                          )
                        }

                      </div>


                      {/* STATUS ACTIONS */}

                      <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      ">

                        <button
                          onClick={() =>
                            updateAlertStatus(
                              item.id,
                              "NEW"
                            )
                          }
                          className="
                            px-3 py-2 rounded-lg
                            bg-yellow-500/10
                            hover:bg-yellow-500/20
                            border border-yellow-500/30
                            text-yellow-400
                            text-xs font-semibold
                            transition flex
                            items-center gap-2
                          "
                        >

                          <FaClock />

                          New

                        </button>


                        <button
                          onClick={() =>
                            updateAlertStatus(
                              item.id,
                              "ACKNOWLEDGED"
                            )
                          }
                          className="
                            px-3 py-2 rounded-lg
                            bg-blue-500/10
                            hover:bg-blue-500/20
                            border border-blue-500/30
                            text-blue-400
                            text-xs font-semibold
                            transition flex
                            items-center gap-2
                          "
                        >

                          <FaEye />

                          Acknowledge

                        </button>


                        <button
                          onClick={() =>
                            updateAlertStatus(
                              item.id,
                              "RESOLVED"
                            )
                          }
                          className="
                            px-3 py-2 rounded-lg
                            bg-green-500/10
                            hover:bg-green-500/20
                            border border-green-500/30
                            text-green-400
                            text-xs font-semibold
                            transition flex
                            items-center gap-2
                          "
                        >

                          <FaCheckCircle />

                          Resolve

                        </button>


                        <button
                          onClick={() =>
                            deleteAlert(
                              item.id
                            )
                          }
                          className="
                            px-3 py-2 rounded-lg
                            bg-red-500/10
                            hover:bg-red-500/20
                            border border-red-500/30
                            text-red-400
                            text-xs font-semibold
                            transition
                          "
                        >

                          <FaTrash />

                        </button>

                      </div>

                    </div>

                  </div>

                )
              )
            }

          </div>

        )
      }

    </div>

  );

}
