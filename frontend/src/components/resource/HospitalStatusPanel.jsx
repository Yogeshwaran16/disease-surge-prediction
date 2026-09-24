import React from "react";

export default function HospitalStatusPanel({
  data = null,
  resourcePlan = null,
}) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-lg font-bold text-white">
          Hospital Status
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          No hospital resource data available.
        </p>
      </div>
    );
  }

  // ==========================================
  // RESOURCE REQUIREMENTS FROM AI PLAN
  // ==========================================

  const planResources =
    Array.isArray(resourcePlan?.resources)
      ? resourcePlan.resources
      : [];

  const getRequiredValue = (resourceName) => {
    const item = planResources.find(
      (resource) =>
        String(resource?.resource || "")
          .toLowerCase()
          .trim() ===
        resourceName.toLowerCase().trim()
    );

    return Number(item?.required) || 0;
  };

  // ==========================================
  // RESOURCE DATA
  // ==========================================

  const resources = [
    {
      name: "Hospital Beds",
      available: Number(data.hospital_beds) || 0,
      required: getRequiredValue("Hospital Beds"),
      icon: "🛏️",
    },

    {
      name: "Ambulances",
      available: Number(data.ambulances) || 0,
      required: getRequiredValue("Ambulances"),
      icon: "🚑",
    },

    {
      name: "Medical Staff",
      available: Number(data.medical_staff) || 0,
      required: getRequiredValue("Medical Staff"),
      icon: "👨‍⚕️",
    },

    {
      name: "Dengue Test Kits",
      available: Number(data.dengue_test_kits) || 0,
      required: getRequiredValue("Dengue Test Kits"),
      icon: "🧪",
    },
  ];

  // ==========================================
  // STATUS CALCULATION
  // ==========================================

  const getResourceStatus = (
    available,
    required
  ) => {
    // If AI requirement is not available yet
    if (required <= 0) {
      return {
        label: "Monitoring",
        text: "text-slate-400",
        bar: "bg-slate-500",
      };
    }

    const percentage =
      (available / required) * 100;

    if (percentage >= 100) {
      return {
        label: "Available",
        text: "text-green-400",
        bar: "bg-green-500",
      };
    }

    if (percentage >= 75) {
      return {
        label: "Warning",
        text: "text-orange-400",
        bar: "bg-orange-500",
      };
    }

    return {
      label: "Critical",
      text: "text-red-400",
      bar: "bg-red-500",
    };
  };

  // ==========================================
  // RESOURCE CARD
  // ==========================================

  const renderResourceCard = (resource) => {
    const {
      name,
      available,
      required,
      icon,
    } = resource;

    const status =
      getResourceStatus(
        available,
        required
      );

    const gap =
      Math.max(
        0,
        required - available
      );

    const availabilityPercent =
      required > 0
        ? Math.min(
            (available / required) * 100,
            100
          )
        : 100;

    return (
      <div
        key={name}
        className="
          rounded-xl
          border
          border-slate-700
          bg-slate-800
          p-5
        "
      >

        {/* TOP */}

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <span className="text-2xl">
              {icon}
            </span>

            <div>

              <p className="text-sm font-medium text-slate-300">
                {name}
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {available.toLocaleString()}
              </p>

            </div>

          </div>

          <span
            className={`
              text-xs
              font-semibold
              ${status.text}
            `}
          >
            {status.label}
          </span>

        </div>


        {/* AVAILABLE / REQUIRED */}

        <div className="mt-4 flex items-center justify-between text-xs">

          <span className="text-slate-400">
            Available
          </span>

          <span className="font-semibold text-cyan-400">
            {available.toLocaleString()}
          </span>

        </div>

        <div className="mt-1 flex items-center justify-between text-xs">

          <span className="text-slate-400">
            Required
          </span>

          <span className="font-semibold text-orange-400">
            {required > 0
              ? required.toLocaleString()
              : "Pending"}
          </span>

        </div>


        {/* GAUGE */}

        <div className="mt-4">

          <div className="flex items-center justify-between text-xs mb-2">

            <span className="text-slate-500">
              Availability
            </span>

            <span
              className={`
                font-semibold
                ${status.text}
              `}
            >
              {required > 0
                ? `${availabilityPercent.toFixed(1)}%`
                : "—"}
            </span>

          </div>

          <div
            className="
              h-2
              w-full
              rounded-full
              bg-slate-700
              overflow-hidden
            "
          >

            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-500
                ${status.bar}
              `}
              style={{
                width: `${availabilityPercent}%`,
              }}
            />

          </div>

        </div>


        {/* GAP */}

        <div className="mt-4 flex items-center justify-between">

          <span className="text-xs text-slate-500">
            Resource Gap
          </span>

          <span
            className={`
              text-sm
              font-bold
              ${
                gap > 0
                  ? "text-red-400"
                  : "text-green-400"
              }
            `}
          >
            {gap > 0
              ? `-${gap.toLocaleString()}`
              : "0"}
          </span>

        </div>

      </div>
    );
  };


  // ==========================================
  // OVERALL STATUS
  // ==========================================

  const shortageCount =
    resources.filter((resource) => {
      if (resource.required <= 0) {
        return false;
      }

      return (
        resource.available <
        resource.required
      );
    }).length;

  const overallStatus =
    shortageCount === 0
      ? {
          label: "Resources Adequate",
          style:
            "border-green-500/30 bg-green-500/10 text-green-400",
        }
      : {
          label: `${shortageCount} Resource Shortage${
            shortageCount > 1 ? "s" : ""
          }`,
          style:
            "border-red-500/30 bg-red-500/10 text-red-400",
        };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
        p-6
        shadow-lg
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

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Hospital Resource Monitoring
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-bold
              text-white
            "
          >
            Hospital Status
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {data.district || "District"}
          </p>

        </div>


        <div className="flex items-center gap-3">

          <span
            className={`
              rounded-full
              border
              px-3
              py-1
              text-xs
              font-semibold
              ${overallStatus.style}
            `}
          >
            {overallStatus.label}
          </span>

          <span
            className="
              rounded-full
              border
              border-green-500/30
              bg-green-500/10
              px-3
              py-1
              text-xs
              font-semibold
              text-green-400
            "
          >
            LIVE STATUS
          </span>

        </div>

      </div>


      {/* RESOURCE GRID */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
        "
      >

        {resources.map(
          renderResourceCard
        )}

      </div>


      {/* UPDATED TIME */}

      {data.updated_at && (

        <p
          className="
            mt-5
            text-xs
            text-slate-500
          "
        >
          Last updated:{" "}
          {new Date(
            data.updated_at
          ).toLocaleString()}
        </p>

      )}

    </div>
  );
}