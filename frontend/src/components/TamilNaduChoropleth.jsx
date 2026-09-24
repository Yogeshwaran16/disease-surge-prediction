import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  MapContainer,
  GeoJSON,
  TileLayer,
} from "react-leaflet";

import { feature } from "topojson-client";

import "leaflet/dist/leaflet.css";


const TamilNaduChoropleth = ({
  districtsData = [],
  onDistrictSelect,
}) => {

  const [geoData, setGeoData] =
    useState(null);


  useEffect(() => {

    fetch("/tamilnadu.json")

      .then((res) => {

        if (!res.ok) {

          throw new Error(
            "Failed to load tamilnadu.json"
          );

        }

        return res.json();

      })

      .then((topology) => {

        const objectKey =
          Object.keys(
            topology.objects
          )[0];


        const geojson = feature(
          topology,
          topology.objects[objectKey]
        );


        console.log(
          "Map District Count:",
          geojson.features.length
        );


        setGeoData(geojson);

      })

      .catch((err) => {

        console.error(
          "Map Load Error:",
          err
        );

      });

  }, []);


  /* DISTRICT NAME NORMALIZATION */

  const normalize = (
    districtName
  ) => {

    return String(
      districtName || ""
    )

      .toLowerCase()

      .trim()

      .replace(
        / district$/i,
        ""
      )

      .replace(
        "the nilgiris",
        "nilgiris"
      )

      .replace(
        "nilgiri",
        "nilgiris"
      )

      .replace(
        "viluppuram",
        "villupuram"
      )

      .replace(
        "thiruvallur",
        "tiruvallur"
      )

      .replace(
        "kancheepuram",
        "kanchipuram"
      )

      .replace(
        "thoothukudi",
        "tuticorin"
      )

      .replace(
        "thoothukkudi",
        "tuticorin"
      )

      .replace(
        "tiruchirappalli",
        "trichy"
      )

      .replace(
        "tiruchirapalli",
        "trichy"
      )

      .replace(
        "tiruchchirappalli",
        "trichy"
      )

      .replace(
        "trichirapalli",
        "trichy"
      )

      .replace(
        "tirupattur",
        "tirupathur"
      )

      .replace(
        "thiruvarur",
        "tiruvarur"
      )

      .replace(
        /-/g,
        " "
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim();

  };


  /* RISK PRIORITY */

  const riskPriority = {

    CRITICAL: 4,

    HIGH: 3,

    MEDIUM: 2,

    LOW: 1,

  };


  /* CREATE DISTRICT LOOKUP */

  const districtLookup =
    useMemo(() => {

      const lookup = {};


      districtsData.forEach(
        (district) => {

          const name =
            district?.district ||
            district?.district_name ||
            district?.District ||
            district?.DISTRICT ||
            district?.name ||
            district?.Name;


          const normalizedName =
            normalize(name);


          if (!normalizedName) {

            return;

          }


          const existing =
            lookup[normalizedName];


          const currentRisk =
            String(
              district?.risk_level || ""
            ).toUpperCase();


          const existingRisk =
            String(
              existing?.risk_level || ""
            ).toUpperCase();


          if (

            !existing ||

            (
              riskPriority[currentRisk] || 0
            ) >

            (
              riskPriority[existingRisk] || 0
            )

          ) {

            lookup[
              normalizedName
            ] = district;

          }

        }
      );


      console.log(
        "District Lookup:",
        lookup
      );


      return lookup;

    }, [districtsData]);


  /* GET DISTRICT NAME FROM MAP */

  const getDistrictName = (
    mapFeature
  ) => {

    return (

      mapFeature?.properties
        ?.district ||

      mapFeature?.properties
        ?.DISTRICT ||

      mapFeature?.properties
        ?.District ||

      mapFeature?.properties
        ?.NAME_2 ||

      mapFeature?.properties
        ?.NAME ||

      mapFeature?.properties
        ?.name ||

      ""

    );

  };


  /* MATCH API DATA WITH MAP */

  const getDistrictData = (
    districtName
  ) => {

    const geoName =
      normalize(
        districtName
      );


    let district =
      districtLookup[
        geoName
      ];


    if (district) {

      return district;

    }


    district =
      Object.values(
        districtLookup
      ).find((d) => {

        const apiName =
          normalize(

            d?.district ||
            d?.district_name ||
            d?.name

          );


        if (!apiName) {

          return false;

        }


        return (

          apiName === geoName ||

          apiName.includes(
            geoName
          ) ||

          geoName.includes(
            apiName
          )

        );

      });


    return district || null;

  };


  /* GET MAP COLOR */

  const getColor = (
    risk
  ) => {

    switch (
      String(
        risk || ""
      ).toUpperCase()
    ) {

      case "CRITICAL":
        return "#7f1d1d";

      case "HIGH":
        return "#ef4444";

      case "MEDIUM":
        return "#f59e0b";

      case "LOW":
        return "#22c55e";

      default:
        return "#64748b";

    }

  };


  /* STYLE EACH DISTRICT */

  const styleFeature = (
    mapFeature
  ) => {

    const districtName =
      getDistrictName(
        mapFeature
      );


    const districtData =
      getDistrictData(
        districtName
      );


    return {

      fillColor:
        getColor(
          districtData?.risk_level
        ),

      fillOpacity: 0.75,

      color: "#ffffff",

      weight: 1,

      opacity: 1,

    };

  };


  /* MAP INTERACTIONS */

  const onEachFeature = (
    mapFeature,
    layer
  ) => {

    const districtName =
      getDistrictName(
        mapFeature
      );


    const districtData =
      getDistrictData(
        districtName
      );


    const risk =
      districtData?.risk_level ||
      "NO DATA";


    const probability =
      districtData?.surge_probability !==
      undefined

        ? (
            Number(
              districtData.surge_probability
            ) * 100
          ).toFixed(1)

        : "0.0";


    const cases =
      districtData?.expected_cases_2w ||
      0;


    const disease =
      districtData?.disease ||
      "N/A";


    layer.bindTooltip(

      `
      <div style="min-width:160px">

        <strong>
          ${districtName}
        </strong>

        <br/>

        Disease:
        ${disease}

        <br/>

        Risk:
        ${risk}

        <br/>

        Probability:
        ${probability}%

        <br/>

        Expected Cases:
        ${cases}

      </div>
      `,

      {
        sticky: true,
      }

    );


    layer.on({

      mouseover: (e) => {

        e.target.setStyle({

          weight: 3,

          color: "#111827",

          fillOpacity: 0.95,

        });

      },


      mouseout: (e) => {

        e.target.setStyle({

          weight: 1,

          color: "#ffffff",

          fillOpacity: 0.75,

        });

      },


      click: () => {

        console.log(
          "Clicked District:",
          districtName
        );


        if (onDistrictSelect) {

          onDistrictSelect(
            districtName
          );

        }

      },

    });

  };


  /* LOADING */

  if (!geoData) {

    return (

      <div
        style={{

          height: "500px",

          padding: "20px",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          color: "#111827",

          background: "#f8fafc",

          borderRadius: "12px",

        }}
      >

        Loading Tamil Nadu Map...

      </div>

    );

  }


  /* MAP */

  return (

    <div
      style={{

        background: "#ffffff",

        borderRadius: "12px",

        overflow: "hidden",

      }}
    >

      <MapContainer

        center={[
          10.9,
          78.7,
        ]}

        zoom={7}

        scrollWheelZoom={true}

        style={{

          height: "650px",

          width: "100%",

        }}

      >

        <TileLayer

          attribution="© OpenStreetMap"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        <GeoJSON

          data={geoData}

          style={styleFeature}

          onEachFeature={onEachFeature}

        />

      </MapContainer>


      {/* MAP LEGEND */}

      <div
        style={{

          padding: "15px",

          display: "flex",

          gap: "20px",

          flexWrap: "wrap",

          fontWeight: "600",

          color: "#111827",

          background: "#f8fafc",

        }}
      >

        <span>
          🔴 Critical
        </span>

        <span>
          🔴 High Risk
        </span>

        <span>
          🟡 Medium Risk
        </span>

        <span>
          🟢 Low Risk
        </span>

        <span>
          ⚪ No Data
        </span>

      </div>

    </div>

  );

};


export default TamilNaduChoropleth;
