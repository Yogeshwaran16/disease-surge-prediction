import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// ============================================================
// TAMIL NADU DISTRICT APPROXIMATE CENTERS
// ============================================================

const DISTRICT_COORDINATES = {
  Ariyalur: [11.1401, 79.0786],
  Chengalpattu: [12.6819, 79.9888],
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Cuddalore: [11.7480, 79.7714],
  Dharmapuri: [12.1277, 78.1579],
  Dindigul: [10.3673, 77.9803],
  Erode: [11.3410, 77.7172],
  Kallakurichi: [11.7404, 78.9590],
  Kanchipuram: [12.8342, 79.7036],
  Kanniyakumari: [8.0883, 77.5385],
  Karur: [10.9601, 78.0766],
  Krishnagiri: [12.5186, 78.2137],
  Madurai: [9.9252, 78.1198],
  Mayiladuthurai: [11.1035, 79.6550],
  Nagapattinam: [10.7672, 79.8449],
  Namakkal: [11.2194, 78.1677],
  Perambalur: [11.2320, 78.8800],
  Pudukkottai: [10.3797, 78.8208],
  Ramanathapuram: [9.3639, 78.8395],
  Ranipet: [12.9249, 79.3333],
  Salem: [11.6643, 78.1460],
  Sivaganga: [9.8433, 78.4809],
  Tenkasi: [8.9590, 77.3152],
  Thanjavur: [10.7867, 79.1378],
  Theni: [10.0104, 77.4768],
  "The Nilgiris": [11.4916, 76.7337],
  Thiruvallur: [13.1439, 79.9082],
  Tiruvarur: [10.7661, 79.6381],
  Tiruchirappalli: [10.7905, 78.7047],
  Tirunelveli: [8.7139, 77.7567],
  Tirupathur: [12.4996, 78.5743],
  Tiruppur: [11.1085, 77.3411],
  Tiruvannamalai: [12.2253, 79.0747],
  Tuticorin: [8.7642, 78.1348],
  Vellore: [12.9165, 79.1325],
  Villupuram: [11.9401, 79.4861],
  Virudhunagar: [9.5680, 77.9624],
};


// ============================================================
// RISK HELPERS
// ============================================================

const getRiskColor = (riskLevel) => {
  switch (
    String(riskLevel || "LOW")
      .toUpperCase()
      .trim()
  ) {
    case "CRITICAL":
      return "#dc2626";

    case "HIGH":
      return "#f97316";

    case "MEDIUM":
      return "#eab308";

    case "LOW":
      return "#22c55e";

    default:
      return "#64748b";
  }
};


const getRiskLabel = (riskLevel) => {
  const risk = String(
    riskLevel || "NO_DATA"
  )
    .toUpperCase()
    .trim();

  return risk === "NO_DATA"
    ? "NO DATA"
    : risk;
};


const normalizeProbability = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  // Supports both:
  // 0.85 -> 85%
  // 85   -> 85%
  return number <= 1
    ? number * 100
    : number;
};


// ============================================================
// MAP CENTER
// ============================================================

function MapCenterController() {
  const map = useMap();

  React.useEffect(() => {
    map.setView(
      [10.8505, 78.7000],
      7
    );
  }, [map]);

  return null;
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TamilNaduRiskMap({
  districts = [],
  onDistrictSelect,
}) {

  // ----------------------------------------------------------
  // NORMALIZE DISTRICT DATA
  // ----------------------------------------------------------

  const normalizedDistricts = useMemo(() => {

    if (!Array.isArray(districts)) {
      return [];
    }

    return districts
      .map((district) => {

        const name = String(
          district?.district || ""
        ).trim();

        if (!name) {
          return null;
        }

        const coordinates =
          DISTRICT_COORDINATES[name];

        if (!coordinates) {
          return null;
        }

        const probability = normalizeProbability(
          district?.surge_probability ??
          district?.probability ??
          0
        );

        const cases =
          district?.expected_cases_2w ??
          district?.predicted_cases ??
          district?.cases ??
          0;

        return {
          ...district,

          district: name,

          risk_level:
            district?.risk_level ||
            "LOW",

          disease:
            district?.disease ||
            "Unknown",

          probability,

          cases,

          coordinates,
        };

      })
      .filter(Boolean);

  }, [districts]);


  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-lg font-semibold text-white">
            Tamil Nadu Risk Heatmap
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Live district-level disease surge risk
          </p>

        </div>


        {/* ===================================================
            LEGEND
        =================================================== */}

        <div className="flex flex-wrap items-center gap-3 text-xs">

          <LegendItem
            color="#dc2626"
            label="Critical"
          />

          <LegendItem
            color="#f97316"
            label="High"
          />

          <LegendItem
            color="#eab308"
            label="Medium"
          />

          <LegendItem
            color="#22c55e"
            label="Low"
          />

        </div>

      </div>


      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="relative h-[520px] w-full">

        <MapContainer
          center={[10.8505, 78.7000]}
          zoom={7}
          minZoom={6}
          maxZoom={11}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          <MapCenterController />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* =================================================
              DISTRICT MARKERS
          ================================================= */}

          {normalizedDistricts.map(
            (district) => {

              const riskColor =
                getRiskColor(
                  district.risk_level
                );

              return (
                <CircleMarker
                  key={
                    district.district
                  }
                  center={
                    district.coordinates
                  }
                  radius={Math.max(
                    9,
                    Math.min(
                      22,
                      9 +
                        district.probability /
                          10
                    )
                  )}
                  pathOptions={{
                    color:
                      "#ffffff",
                    weight: 1.5,
                    fillColor:
                      riskColor,
                    fillOpacity:
                      0.82,
                  }}
                  eventHandlers={{
                    click: () => {

                      if (
                        typeof onDistrictSelect ===
                        "function"
                      ) {
                        onDistrictSelect(
                          district.district
                        );
                      }

                    },
                  }}
                >

                  <Popup>

                    <div className="min-w-[190px]">

                      <div className="mb-2 flex items-center justify-between gap-3">

                        <strong className="text-base">
                          {
                            district.district
                          }
                        </strong>

                        <span
                          style={{
                            color:
                              riskColor,
                            fontWeight:
                              700,
                          }}
                        >
                          {getRiskLabel(
                            district.risk_level
                          )}
                        </span>

                      </div>


                      <div className="space-y-1 text-sm">

                        <div>
                          <strong>
                            Disease:
                          </strong>{" "}
                          {
                            district.disease
                          }
                        </div>

                        <div>
                          <strong>
                            Probability:
                          </strong>{" "}
                          {district.probability.toFixed(
                            1
                          )}
                          %
                        </div>

                        <div>
                          <strong>
                            Expected cases:
                          </strong>{" "}
                          {district.cases}
                        </div>

                        {district.year && (
                          <div>
                            <strong>
                              Year:
                            </strong>{" "}
                            {
                              district.year
                            }
                          </div>
                        )}

                        {district.week_number && (
                          <div>
                            <strong>
                              Week:
                            </strong>{" "}
                            {
                              district.week_number
                            }
                          </div>
                        )}

                      </div>

                    </div>

                  </Popup>

                </CircleMarker>
              );

            }
          )}

        </MapContainer>


        {/* ===================================================
            DATA COUNT
        =================================================== */}

        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-2 text-xs text-slate-300 shadow-lg">

          Showing{" "}
          <span className="font-semibold text-white">
            {
              normalizedDistricts.length
            }
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white">
            38
          </span>{" "}
          districts

        </div>

      </div>

    </div>
  );
}


// ============================================================
// LEGEND ITEM
// ============================================================

function LegendItem({
  color,
  label,
}) {

  return (
    <div className="flex items-center gap-1.5">

      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor:
            color,
        }}
      />

      <span className="text-slate-400">
        {label}
      </span>

    </div>
  );
}