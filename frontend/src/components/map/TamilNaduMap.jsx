import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// ============================================
// TAMIL NADU DISTRICT APPROXIMATE LOCATIONS
// ============================================

const DISTRICT_COORDINATES = {
  Ariyalur: [11.14, 79.08],
  Chengalpattu: [12.68, 79.98],
  Chennai: [13.08, 80.27],
  Coimbatore: [11.02, 76.96],
  Cuddalore: [11.75, 79.77],
  Dharmapuri: [12.13, 78.16],
  Dindigul: [10.36, 77.98],
  Erode: [11.34, 77.72],
  Kallakurichi: [11.74, 78.96],
  Kancheepuram: [12.83, 79.70],
  Karur: [10.96, 78.08],
  Krishnagiri: [12.52, 78.21],
  Madurai: [9.93, 78.12],
  Mayiladuthurai: [11.10, 79.65],
  Nagapattinam: [10.77, 79.84],
  Namakkal: [11.22, 78.17],
  Perambalur: [11.23, 78.88],
  Pudukkottai: [10.38, 78.82],
  Ramanathapuram: [9.37, 78.83],
  Ranipet: [12.93, 79.33],
  Salem: [11.66, 78.16],
  Sivaganga: [9.84, 78.48],
  Tenkasi: [8.96, 77.32],
  Thanjavur: [10.79, 79.14],
  Theni: [10.01, 77.48],
  Thoothukudi: [8.81, 78.15],
  Tiruchirappalli: [10.79, 78.70],
  Tirunelveli: [8.71, 77.76],
  Tirupathur: [12.50, 78.57],
  Tiruppur: [11.11, 77.34],
  Tiruvallur: [13.14, 79.91],
  Tiruvannamalai: [12.23, 79.07],
  Tiruvarur: [10.77, 79.64],
  Vellore: [12.92, 79.13],
  Viluppuram: [11.94, 79.49],
  Virudhunagar: [9.59, 77.96],
  "The Nilgiris": [11.41, 76.69],
};


// ============================================
// DEFAULT CENTER
// ============================================

const TAMIL_NADU_CENTER = [
  10.95,
  78.65,
];


// ============================================
// RISK COLOR
// ============================================

function getRiskColor(riskLevel) {

  const risk =
    String(riskLevel || "LOW")
      .toUpperCase();

  if (risk === "HIGH") {
    return "#ef4444";
  }

  if (risk === "MEDIUM") {
    return "#eab308";
  }

  return "#22c55e";
}


// ============================================
// NORMALIZE PROBABILITY
// ============================================

function getProbability(value) {

  const number =
    Number(value) || 0;

  const percentage =
    number <= 1
      ? number * 100
      : number;

  return Math.min(
    Math.max(percentage, 0),
    100
  );
}


// ============================================
// DISTRICT MARKER
// ============================================

function DistrictMarker({ district }) {

  const districtName =
    district?.district ||
    "Unknown District";

  const coordinates =
    DISTRICT_COORDINATES[districtName];

  // Skip districts without coordinates
  if (!coordinates) {
    return null;
  }


  const riskLevel =
    district?.risk_level ||
    district?.riskLevel ||
    "LOW";

  const probability =
    getProbability(
      district?.probability ??
      district?.risk_probability ??
      0
    );

  const cases =
    Number(
      district?.cases ??
      district?.predicted_cases ??
      0
    ) || 0;

  const disease =
    district?.disease ||
    "Unknown";


  return (

    <CircleMarker

      center={coordinates}

      radius={
        Math.max(
          8,
          Math.min(
            18,
            8 + probability / 10
          )
        )
      }

      pathOptions={{
        color: getRiskColor(riskLevel),
        fillColor: getRiskColor(riskLevel),
        fillOpacity: 0.65,
        weight: 2,
      }}

    >

      <Popup>

        <div className="min-w-[190px]">

          <h3 className="
            text-base
            font-bold
          ">
            {districtName}
          </h3>

          <div className="mt-2 space-y-1 text-sm">

            <p>
              <strong>Disease:</strong>{" "}
              {disease}
            </p>

            <p>
              <strong>Risk:</strong>{" "}
              {String(riskLevel).toUpperCase()}
            </p>

            <p>
              <strong>Probability:</strong>{" "}
              {probability.toFixed(1)}%
            </p>

            <p>
              <strong>Predicted Cases:</strong>{" "}
              {cases.toLocaleString()}
            </p>

          </div>

        </div>

      </Popup>

    </CircleMarker>

  );
}


// ============================================
// TAMIL NADU MAP
// ============================================

export default function TamilNaduMap({
  districts = [],
  height = "500px",
}) {

  // ------------------------------------------
  // NORMALIZE DISTRICT DATA
  // ------------------------------------------

  const districtData = useMemo(() => {

    if (!Array.isArray(districts)) {
      return [];
    }

    return districts;

  }, [districts]);


  return (

    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        shadow-lg
      "
    >

      {/* -------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------- */}

      <div className="
        flex
        items-center
        justify-between
        border-b
        border-slate-800
        px-5
        py-4
      ">

        <div>

          <h2 className="
            text-lg
            font-semibold
            text-white
          ">
            Tamil Nadu Risk Map
          </h2>

          <p className="
            mt-1
            text-xs
            text-slate-500
          ">
            District-level disease outbreak risk
          </p>

        </div>


        {/* ---------------------------------- */}
        {/* LEGEND */}
        {/* ---------------------------------- */}

        <div className="
          hidden
          items-center
          gap-4
          sm:flex
        ">

          <div className="
            flex
            items-center
            gap-1.5
          ">

            <span className="
              h-2.5
              w-2.5
              rounded-full
              bg-red-500
            />

            <span className="
              text-xs
              text-slate-400
            ">
              High
            </span>

          </div>


          <div className="
            flex
            items-center
            gap-1.5
          ">

            <span className="
              h-2.5
              w-2.5
              rounded-full
              bg-yellow-500
            />

            <span className="
              text-xs
              text-slate-400
            ">
              Medium
            </span>

          </div>


          <div className="
            flex
            items-center
            gap-1.5
          ">

            <span className="
              h-2.5
              w-2.5
              rounded-full
              bg-green-500
            />

            <span className="
              text-xs
              text-slate-400
            ">
              Low
            </span>

          </div>

        </div>

      </div>


      {/* -------------------------------------- */}
      {/* MAP */}
      {/* -------------------------------------- */}

      <div
        style={{
          height,
          width: "100%",
        }}
      >

        <MapContainer

          center={TAMIL_NADU_CENTER}

          zoom={7}

          minZoom={6}

          maxZoom={11}

          scrollWheelZoom={true}

          style={{
            height: "100%",
            width: "100%",
          }}

        >

          <TileLayer

            attribution='&copy; OpenStreetMap contributors'

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          />


          {/* -------------------------------- */}
          {/* DISTRICT MARKERS */}
          {/* -------------------------------- */}

          {districtData.map(
            (district, index) => (

              <DistrictMarker

                key={
                  district?.district ||
                  `district-${index}`
                }

                district={district}

              />

            )
          )}

        </MapContainer>

      </div>

    </div>

  );
}
