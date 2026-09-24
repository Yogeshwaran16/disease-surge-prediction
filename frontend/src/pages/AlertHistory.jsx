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
  FaSyncAlt,
  FaEnvelope,
  FaMobileAlt,
  FaWhatsapp,
  FaDesktop,
} from "react-icons/fa";

import {
  getBackendAlerts,
  getAlertDeliveryStatus,
} from "../services/api";


// ============================================
// ALERT HISTORY PAGE
// MODULE 8 - AUTOMATIC ALERT & COMMUNICATION
// ============================================

export default function AlertHistory() {
  const [history, setHistory] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [backendError, setBackendError] =
    useState("");

  const [deliveryLoading, setDeliveryLoading] =
    useState({});


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
  // NORMALIZE BACKEND ALERT
  // ============================================

  const normalizeBackendAlert = (
    alert
  ) => {
    const alertId =
      alert?._id ||
      alert?.id ||
      alert?.alert_id;

    const issuedAt =
      alert?.issued_at ||
      alert?.createdAt ||
      alert?.created_at;

    return {
      id: String(
        alertId || `backend-${Date.now()}`
      ),

      backend_id: alertId
        ? String(alertId)
        : null,

      district:
        alert?.district ||
        "Unknown District",

      disease:
        alert?.disease ||
        "Disease Surveillance",

      alert_level:
        alert?.risk_level ||
        alert?.alert_level ||
        "LOW",

      risk_level:
        alert?.risk_level ||
        alert?.alert_level ||
        "LOW",

      probability:
        alert?.probability ?? null,

      priority:
        alert?.priority ||
        "MEDIUM",

      message:
        alert?.english_alert ||
        alert?.message ||
        "No alert message available",

      english_alert:
        alert?.english_alert ||
        alert?.message ||
        "",

      tamil_alert:
        alert?.tamil_alert ||
        "",

      alert_status:
        alert?.alert_status ||
        "NEW",

      generated_at:
        issuedAt
          ? new Date(
              issuedAt
            ).toLocaleString()
          : new Date().toLocaleString(),

      issued_at:
        issuedAt || null,

      resolved:
        Boolean(alert?.resolved),

      resolved_at:
        alert?.resolved_at || null,

      deliveries:
        Array.isArray(
          alert?.deliveries
        )
          ? alert.deliveries
          : [],

      delivery_summary:
        alert?.delivery_summary || {
          total_channels: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
          last_attempt_at: null,
        },

      source:
        "backend",
    };
  };


  // ============================================
  // LOAD LOCAL HISTORY
  // ============================================

  const loadLocalHistory = () => {
    const savedHistory =
      localStorage.getItem(
        "technova_alert_history"
      );

    if (!savedHistory) {
      return [];
    }

    try {
      const parsedHistory =
        JSON.parse(
          savedHistory
        );

      if (
        !Array.isArray(
          parsedHistory
        )
      ) {
        return [];
      }

      return parsedHistory.map(
        (item) => ({
          ...item,

          alert_status:
            item.alert_status ||
            "NEW",

          source:
            item.source ||
            "local",
        })
      );
    } catch (error) {
      console.error(
        "Local History Load Error:",
        error
      );

      return [];
    }
  };


  // ============================================
  // LOAD BACKEND ALERTS
  // ============================================

  const loadBackendHistory =
    async () => {
      try {
        setLoading(true);
        setBackendError("");

        const response =
          await getBackendAlerts();

        const backendAlerts =
          response?.data ||
          response?.alerts ||
          [];

        if (
          !Array.isArray(
            backendAlerts
          )
        ) {
          return [];
        }

        return backendAlerts.map(
          normalizeBackendAlert
        );
      } catch (error) {
        console.error(
          "Backend Alert History Error:",
          error
        );

        setBackendError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to load backend alerts"
        );

        return [];
      } finally {
        setLoading(false);
      }
    };


  // ============================================
  // MERGE LOCAL + BACKEND HISTORY
  // ============================================

  const mergeHistories = (
    localHistory,
    backendHistory
  ) => {
    const merged = [];

    const seenIds =
      new Set();

    // Backend alerts first
    backendHistory.forEach(
      (item) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          merged.push(item);
        }
      }
    );

    // Local alerts next
    localHistory.forEach(
      (item) => {
        const localId =
          String(
            item?.backend_id ||
            item?.id ||
            ""
          );

        if (
          localId &&
          seenIds.has(localId)
        ) {
          return;
        }

        if (
          item?.id &&
          seenIds.has(
            String(item.id)
          )
        ) {
          return;
        }

        merged.push(item);
      }
    );

    return merged.sort(
      (a, b) => {
        const dateA =
          new Date(
            a?.issued_at ||
              a?.generated_at ||
              0
          ).getTime();

        const dateB =
          new Date(
            b?.issued_at ||
              b?.generated_at ||
              0
          ).getTime();

        return dateB - dateA;
      }
    );
  };


  // ============================================
  // LOAD HISTORY
  // ============================================

  const loadHistory =
    async () => {
      const localHistory =
        loadLocalHistory();

      const backendHistory =
        await loadBackendHistory();

      const mergedHistory =
        mergeHistories(
          localHistory,
          backendHistory
        );

      setHistory(
        mergedHistory
      );
    };


  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadHistory();
  }, []);


  // ============================================
  // LISTEN FOR NEW ALERT
  // ============================================

  useEffect(() => {
    const handleAlertUpdate =
      () => {
        loadHistory();
      };

    window.addEventListener(
      "technova-alert-updated",
      handleAlertUpdate
    );

    return () => {
      window.removeEventListener(
        "technova-alert-updated",
        handleAlertUpdate
      );
    };
  }, []);


  // ============================================
  // UPDATE ALERT STATUS
  // ============================================

  const updateAlertStatus =
    (id, newStatus) => {
      const updatedHistory =
        history.map(
          (item) => {
            if (
              String(item.id) ===
              String(id)
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

      // Only persist local alerts
      const localOnly =
        updatedHistory.filter(
          (item) =>
            item.source !==
            "backend"
        );

      localStorage.setItem(
        "technova_alert_history",
        JSON.stringify(
          localOnly
        )
      );

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
            String(item.id) !==
            String(id)
        );

      setHistory(
        updatedHistory
      );

      const localOnly =
        updatedHistory.filter(
          (item) =>
            item.source !==
            "backend"
        );

      localStorage.setItem(
        "technova_alert_history",
        JSON.stringify(
          localOnly
        )
      );

      notifyAlertUpdate();
    };


  // ============================================
  // CLEAR ALL LOCAL HISTORY
  // ============================================

  const clearHistory = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear all local alert history?"
      );

    if (!confirmed) {
      return;
    }

    setHistory(
      history.filter(
        (item) =>
          item.source ===
          "backend"
      )
    );

    localStorage.removeItem(
      "technova_alert_history"
    );

    notifyAlertUpdate();
  };


  // ============================================
  // REFRESH BACKEND ALERTS
  // ============================================

  const refreshAlerts =
    async () => {
      await loadHistory();
    };


  // ============================================
  // LOAD DELIVERY STATUS
  // ============================================

  const loadDeliveryStatus =
    async (alertId) => {
      if (!alertId) {
        return;
      }

      setDeliveryLoading(
        (previous) => ({
          ...previous,
          [alertId]: true,
        })
      );

      try {
        const response =
          await getAlertDeliveryStatus(
            alertId
          );

        const deliveryData =
          response?.data ||
          response;

        setHistory(
          (previous) =>
            previous.map(
              (item) => {
                if (
                  String(
                    item.backend_id ||
                      item.id
                  ) !==
                  String(alertId)
                ) {
                  return item;
                }

                return {
                  ...item,

                  deliveries:
                    deliveryData?.deliveries ||
                    item.deliveries,

                  delivery_summary:
                    deliveryData?.delivery_summary ||
                    item.delivery_summary,
                };
              }
            )
        );
      } catch (error) {
        console.error(
          "Delivery Status Error:",
          error
        );
      } finally {
        setDeliveryLoading(
          (previous) => ({
            ...previous,
            [alertId]: false,
          })
        );
      }
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


  // ============================================
  // DELIVERY STATUS STYLE
  // ============================================

  const getDeliveryStyle =
    (status) => {
      switch (
        String(
          status || "pending"
        ).toLowerCase()
      ) {
        case "delivered":
          return `
            bg-green-500/10
            text-green-400
            border-green-500/20
          `;

        case "failed":
          return `
            bg-red-500/10
            text-red-400
            border-red-500/20
          `;

        default:
          return `
            bg-yellow-500/10
            text-yellow-400
            border-yellow-500/20
          `;
      }
    };


  // ============================================
  // DELIVERY ICON
  // ============================================

  const getChannelIcon =
    (channel) => {
      switch (
        String(
          channel || ""
        ).toLowerCase()
      ) {
        case "email":
          return <FaEnvelope />;

        case "sms":
          return <FaMobileAlt />;

        case "whatsapp":
          return <FaWhatsapp />;

        case "dashboard":
        default:
          return <FaDesktop />;
      }
    };


  // ============================================
  // DELIVERY SUMMARY
  // ============================================

  const getDeliverySummary =
    (item) => {
      const summary =
        item?.delivery_summary;

      if (
        summary &&
        Number(
          summary.total_channels
        ) > 0
      ) {
        return summary;
      }

      const deliveries =
        Array.isArray(
          item?.deliveries
        )
          ? item.deliveries
          : [];

      return {
        total_channels:
          deliveries.length,

        delivered:
          deliveries.filter(
            (delivery) =>
              delivery.status ===
              "delivered"
          ).length,

        failed:
          deliveries.filter(
            (delivery) =>
              delivery.status ===
              "failed"
          ).length,

        pending:
          deliveries.filter(
            (delivery) =>
              delivery.status ===
              "pending"
          ).length,
      };
    };


  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 space-y-6">

      {/* ========================================
          HEADER
      ======================================== */}

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


        <div className="flex items-center gap-2">

          <button
            onClick={refreshAlerts}
            disabled={loading}
            className="
              bg-cyan-500/10
              hover:bg-cyan-500/20
              border
              border-cyan-500/30
              text-cyan-400
              px-4
              py-2
              rounded-lg
              font-semibold
              transition
              flex
              items-center
              gap-2
              disabled:opacity-50
            "
          >
            <FaSyncAlt
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>


          {history.length > 0 && (
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

              Clear Local
            </button>
          )}

        </div>

      </div>


      {/* ========================================
          BACKEND ERROR
      ======================================== */}

      {backendError && (
        <div
          className="
            bg-orange-500/10
            border
            border-orange-500/30
            text-orange-400
            rounded-lg
            px-4
            py-3
            text-sm
          "
        >
          Backend alerts could not be loaded.
          Local alert history is still available.
        </div>
      )}


      {/* ========================================
          LOADING
      ======================================== */}

      {loading && history.length === 0 && (
        <div
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-8
            text-center
            text-slate-400
          "
        >
          Loading alerts...
        </div>
      )}


      {/* ========================================
          SUMMARY
      ======================================== */}

      {history.length > 0 && (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >

          <div
            className="
              bg-yellow-500/10
              border
              border-yellow-500/20
              rounded-xl
              p-4
            "
          >

            <p className="text-yellow-400 text-sm">
              New Alerts
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-2
              "
            >
              {
                history.filter(
                  (item) =>
                    item.alert_status ===
                    "NEW"
                ).length
              }
            </h2>

          </div>


          <div
            className="
              bg-blue-500/10
              border
              border-blue-500/20
              rounded-xl
              p-4
            "
          >

            <p className="text-blue-400 text-sm">
              Acknowledged
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-2
              "
            >
              {
                history.filter(
                  (item) =>
                    item.alert_status ===
                    "ACKNOWLEDGED"
                ).length
              }
            </h2>

          </div>


          <div
            className="
              bg-green-500/10
              border
              border-green-500/20
              rounded-xl
              p-4
            "
          >

            <p className="text-green-400 text-sm">
              Resolved
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-2
              "
            >
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

      )}


      {/* ========================================
          EMPTY
      ======================================== */}

      {!loading &&
        history.length === 0 && (

          <div
            className="
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              p-10
              text-center
            "
          >

            <FaBell
              className="
                text-slate-500
                text-4xl
                mx-auto
                mb-4
              "
            />

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              No Alert History
            </h2>

            <p
              className="
                text-slate-400
                mt-2
              "
            >
              Generate district alerts to see
              them here.
            </p>

          </div>

        )}


      {/* ========================================
          HISTORY LIST
      ======================================== */}

      {history.length > 0 && (

        <div className="space-y-4">

          {history.map(
            (item) => {

              const deliverySummary =
                getDeliverySummary(
                  item
                );

              return (

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

                  <div
                    className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-5
                    "
                  >

                    {/* ALERT INFO */}

                    <div className="flex-1">

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        "
                      >

                        <FaMapMarkerAlt
                          className="
                            text-cyan-400
                          "
                        />

                        <h3
                          className="
                            text-lg
                            font-semibold
                            text-white
                          "
                        >
                          {item.district}
                        </h3>


                        <span
                          className={`
                            px-3
                            py-1
                            rounded-lg
                            border
                            text-xs
                            font-bold
                            ${getRiskStyle(
                              item.alert_level
                            )}
                          `}
                        >
                          {item.alert_level}
                        </span>


                        <span
                          className={`
                            px-3
                            py-1
                            rounded-lg
                            border
                            text-xs
                            font-bold
                            ${getStatusStyle(
                              item.alert_status
                            )}
                          `}
                        >
                          {item.alert_status ||
                            "NEW"}
                        </span>


                        {item.source ===
                          "backend" && (
                          <span
                            className="
                              px-3
                              py-1
                              rounded-lg
                              border
                              text-xs
                              font-bold
                              bg-cyan-500/10
                              text-cyan-400
                              border-cyan-500/20
                            "
                          >
                            BACKEND
                          </span>
                        )}

                      </div>


                      <p
                        className="
                          text-slate-400
                          text-sm
                          mt-3
                        "
                      >
                        Disease:{" "}

                        <span className="text-white">
                          {item.disease}
                        </span>
                      </p>


                      <p
                        className="
                          text-slate-400
                          text-sm
                          mt-2
                        "
                      >
                        {item.message}
                      </p>


                      {item.probability !==
                        null &&
                        item.probability !==
                          undefined && (

                          <p
                            className="
                              text-xs
                              text-slate-500
                              mt-2
                            "
                          >
                            Surge Probability:{" "}

                            <span className="text-slate-300">
                              {(
                                Number(
                                  item.probability
                                ) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </p>

                        )}


                      <p
                        className="
                          text-xs
                          text-slate-500
                          mt-3
                        "
                      >
                        Generated:{" "}

                        {item.generated_at}
                      </p>


                      {item.status_updated_at && (
                        <p
                          className="
                            text-xs
                            text-slate-500
                            mt-1
                          "
                        >
                          Status Updated:{" "}

                          {
                            item.status_updated_at
                          }
                        </p>
                      )}


                      {/* ==================================
                          DELIVERY SUMMARY
                      ================================== */}

                      {item.source ===
                        "backend" && (

                        <div
                          className="
                            mt-4
                            p-3
                            rounded-lg
                            bg-slate-900/50
                            border
                            border-slate-700
                          "
                        >

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-3
                              text-xs
                            "
                          >

                            <span className="text-slate-400">
                              Delivery:
                            </span>

                            <span className="text-slate-300">
                              Total{" "}
                              {
                                deliverySummary.total_channels
                              }
                            </span>

                            <span className="text-green-400">
                              Delivered{" "}
                              {
                                deliverySummary.delivered
                              }
                            </span>

                            <span className="text-red-400">
                              Failed{" "}
                              {
                                deliverySummary.failed
                              }
                            </span>

                            <span className="text-yellow-400">
                              Pending{" "}
                              {
                                deliverySummary.pending
                              }
                            </span>

                          </div>


                          {/* CHANNELS */}

                          {item.deliveries?.length >
                            0 && (

                            <div
                              className="
                                flex
                                flex-wrap
                                gap-2
                                mt-3
                              "
                            >

                              {item.deliveries.map(
                                (
                                  delivery,
                                  index
                                ) => (

                                  <span
                                    key={`${item.id}-${delivery.channel}-${index}`}
                                    className={`
                                      px-3
                                      py-1.5
                                      rounded-lg
                                      border
                                      text-xs
                                      font-semibold
                                      flex
                                      items-center
                                      gap-2
                                      ${getDeliveryStyle(
                                        delivery.status
                                      )}
                                    `}
                                  >

                                    {getChannelIcon(
                                      delivery.channel
                                    )}

                                    {delivery.channel}

                                    <span>
                                      {delivery.status}
                                    </span>

                                    {delivery.attempts >
                                      0 && (
                                      <span>
                                        (
                                        {
                                          delivery.attempts
                                        }
                                        )
                                      </span>
                                    )}

                                  </span>

                                )
                              )}

                            </div>

                          )}


                          {item.backend_id && (

                            <button
                              onClick={() =>
                                loadDeliveryStatus(
                                  item.backend_id
                                )
                              }
                              disabled={
                                deliveryLoading[
                                  item.backend_id
                                ]
                              }
                              className="
                                mt-3
                                text-xs
                                text-cyan-400
                                hover:text-cyan-300
                                transition
                                flex
                                items-center
                                gap-2
                                disabled:opacity-50
                              "
                            >

                              <FaSyncAlt
                                className={
                                  deliveryLoading[
                                    item.backend_id
                                  ]
                                    ? "animate-spin"
                                    : ""
                                }
                              />

                              Refresh Delivery Status

                            </button>

                          )}

                        </div>

                      )}

                    </div>


                    {/* STATUS ACTIONS */}

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          updateAlertStatus(
                            item.id,
                            "NEW"
                          )
                        }
                        className="
                          px-3
                          py-2
                          rounded-lg
                          bg-yellow-500/10
                          hover:bg-yellow-500/20
                          border
                          border-yellow-500/30
                          text-yellow-400
                          text-xs
                          font-semibold
                          transition
                          flex
                          items-center
                          gap-2
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
                          px-3
                          py-2
                          rounded-lg
                          bg-blue-500/10
                          hover:bg-blue-500/20
                          border
                          border-blue-500/30
                          text-blue-400
                          text-xs
                          font-semibold
                          transition
                          flex
                          items-center
                          gap-2
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
                          px-3
                          py-2
                          rounded-lg
                          bg-green-500/10
                          hover:bg-green-500/20
                          border
                          border-green-500/30
                          text-green-400
                          text-xs
                          font-semibold
                          transition
                          flex
                          items-center
                          gap-2
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
                        <FaTrash />
                      </button>

                    </div>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
}