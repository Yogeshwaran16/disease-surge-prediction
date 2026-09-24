const District = require("../models/District");


// ============================================
// GET ALL DISTRICTS
// ============================================

exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    console.error("Get Districts Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch districts.",
    });
  }
};


// ============================================
// GET DISTRICT BY ID
// ============================================

exports.getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: district,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid district ID.",
    });
  }
};


// ============================================
// CREATE DISTRICT
// ADMIN ONLY
// ============================================

exports.createDistrict = async (req, res) => {
  try {
    const {
      name,
      region,
      population,
      latitude,
      longitude,
      lat,
      lng,
      risk_level,
    } = req.body;

    // Accept both:
    // latitude / longitude
    // and legacy:
    // lat / lng

    const finalLat =
      latitude !== undefined
        ? latitude
        : lat;

    const finalLng =
      longitude !== undefined
        ? longitude
        : lng;


    // ========================================
    // REQUIRED VALIDATION
    // ========================================

    if (
      !name ||
      finalLat === undefined ||
      finalLat === null ||
      finalLat === "" ||
      finalLng === undefined ||
      finalLng === null ||
      finalLng === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, latitude and longitude are required.",
      });
    }


    // ========================================
    // COORDINATE VALIDATION
    // ========================================

    const numericLat =
      Number(finalLat);

    const numericLng =
      Number(finalLng);


    if (
      !Number.isFinite(numericLat) ||
      numericLat < -90 ||
      numericLat > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude must be a valid number between -90 and 90.",
      });
    }


    if (
      !Number.isFinite(numericLng) ||
      numericLng < -180 ||
      numericLng > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be a valid number between -180 and 180.",
      });
    }


    // ========================================
    // DUPLICATE CHECK
    // ========================================

    const existingDistrict =
      await District.findOne({
        name: name.trim(),
      });


    if (existingDistrict) {
      return res.status(409).json({
        success: false,
        message:
          "District already exists.",
      });
    }


    // ========================================
    // CREATE CLEAN PAYLOAD
    // ========================================

    const districtPayload = {

      name:
        name.trim(),

      lat:
        numericLat,

      lng:
        numericLng,

    };


    if (region !== undefined) {

      districtPayload.region =
        region;

    }


    if (
      population !== undefined &&
      population !== ""
    ) {

      districtPayload.population =
        Number(population);

    }


    if (
      risk_level !== undefined
    ) {

      districtPayload.risk_level =
        risk_level;

    }


    // ========================================
    // CREATE DISTRICT
    // ========================================

    const district =
      await District.create(
        districtPayload
      );


    return res.status(201).json({

      success: true,

      message:
        "District created successfully.",

      data:
        district,

    });

  } catch (error) {

    console.error(
      "Create District Error:",
      error.message
    );

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }
};


// ============================================
// UPDATE DISTRICT
// ============================================

exports.updateDistrict =
  async (req, res) => {

    try {

      const updateData =
        {
          ...req.body,
        };


      // ======================================
      // NORMALIZE LATITUDE
      // ======================================

      if (
        updateData.latitude !==
        undefined
      ) {

        updateData.lat =
          Number(
            updateData.latitude
          );

        delete updateData.latitude;

      }


      // ======================================
      // NORMALIZE LONGITUDE
      // ======================================

      if (
        updateData.longitude !==
        undefined
      ) {

        updateData.lng =
          Number(
            updateData.longitude
          );

        delete updateData.longitude;

      }


      // ======================================
      // LAT VALIDATION
      // ======================================

      if (
        updateData.lat !==
        undefined
      ) {

        updateData.lat =
          Number(
            updateData.lat
          );


        if (
          !Number.isFinite(
            updateData.lat
          ) ||
          updateData.lat < -90 ||
          updateData.lat > 90
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Latitude must be a valid number between -90 and 90.",

          });

        }

      }


      // ======================================
      // LNG VALIDATION
      // ======================================

      if (
        updateData.lng !==
        undefined
      ) {

        updateData.lng =
          Number(
            updateData.lng
          );


        if (
          !Number.isFinite(
            updateData.lng
          ) ||
          updateData.lng < -180 ||
          updateData.lng > 180
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Longitude must be a valid number between -180 and 180.",

          });

        }

      }


      // ======================================
      // NAME
      // ======================================

      if (
        updateData.name !==
        undefined
      ) {

        updateData.name =
          updateData.name.trim();

      }


      // ======================================
      // POPULATION
      // ======================================

      if (
        updateData.population !==
          undefined &&
        updateData.population !==
          ""
      ) {

        updateData.population =
          Number(
            updateData.population
          );

      }


      // ======================================
      // UPDATE
      // ======================================

      const district =
        await District.findByIdAndUpdate(

          req.params.id,

          updateData,

          {
            new: true,
            runValidators: true,
          }

        );


      if (!district) {

        return res.status(404).json({

          success: false,

          message:
            "District not found.",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "District updated successfully.",

        data:
          district,

      });

    } catch (error) {

      console.error(
        "Update District Error:",
        error.message
      );

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ============================================
// DELETE DISTRICT
// ADMIN ONLY
// ============================================

exports.deleteDistrict =
  async (req, res) => {

    try {

      const district =
        await District.findByIdAndDelete(
          req.params.id
        );


      if (!district) {

        return res.status(404).json({

          success: false,

          message:
            "District not found.",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "District deleted successfully.",

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid district ID.",

      });

    }

  };


// ============================================
// SEARCH DISTRICTS
// ============================================

exports.searchDistricts =
  async (req, res) => {

    try {

      const {
        name
      } = req.query;


      if (!name) {

        return res.status(400).json({

          success: false,

          message:
            "District name is required.",

        });

      }


      const districts =
        await District.find({

          name: {

            $regex:
              name,

            $options:
              "i",

          },

        }).sort({

          name: 1,

        });


      return res.status(200).json({

        success: true,

        count:
          districts.length,

        data:
          districts,

      });

    } catch (error) {

      console.error(
        "Search District Error:",
        error.message
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to search districts.",

      });

    }

  };


// ============================================
// GET DISTRICTS BY RISK LEVEL
// ============================================

exports.getDistrictsByRisk =
  async (req, res) => {

    try {

      const {
        risk_level
      } = req.params;


      const validRiskLevels = [

        "LOW",

        "MEDIUM",

        "HIGH",

        "CRITICAL",

      ];


      const risk =
        risk_level.toUpperCase();


      if (
        !validRiskLevels.includes(
          risk
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid risk level. Use LOW, MEDIUM, HIGH or CRITICAL.",

        });

      }


      const districts =
        await District.find({

          risk_level:
            risk,

        }).sort({

          name: 1,

        });


      return res.status(200).json({

        success: true,

        risk_level:
          risk,

        count:
          districts.length,

        data:
          districts,

      });

    } catch (error) {

      console.error(
        "Risk Filter Error:",
        error.message
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch districts.",

      });

    }

  };


// ============================================
// DISTRICT DASHBOARD STATISTICS
// ============================================

exports.getDistrictStats =
  async (req, res) => {

    try {

      const stats =
        await District.aggregate([

          {

            $group: {

              _id: null,


              totalDistricts: {

                $sum: 1,

              },


              totalPopulation: {

                $sum:
                  "$population",

              },


              totalHospitals: {

                $sum:
                  "$hospitals",

              },


              totalPHCs: {

                $sum:
                  "$phcs",

              },


              highRiskDistricts: {

                $sum: {

                  $cond: [

                    {

                      $eq: [

                        "$risk_level",

                        "HIGH",

                      ],

                    },

                    1,

                    0,

                  ],

                },

              },


              mediumRiskDistricts: {

                $sum: {

                  $cond: [

                    {

                      $eq: [

                        "$risk_level",

                        "MEDIUM",

                      ],

                    },

                    1,

                    0,

                  ],

                },

              },


              lowRiskDistricts: {

                $sum: {

                  $cond: [

                    {

                      $eq: [

                        "$risk_level",

                        "LOW",

                      ],

                    },

                    1,

                    0,

                  ],

                },

              },


              totalActiveAlerts: {

                $sum:
                  "$active_alerts",

              },

            },

          },

        ]);


      const result =
        stats[0] || {

          totalDistricts: 0,

          totalPopulation: 0,

          totalHospitals: 0,

          totalPHCs: 0,

          highRiskDistricts: 0,

          mediumRiskDistricts: 0,

          lowRiskDistricts: 0,

          totalActiveAlerts: 0,

        };


      delete result._id;


      return res.status(200).json({

        success: true,

        data:
          result,

      });

    } catch (error) {

      console.error(
        "District Stats Error:",
        error.message
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch district statistics.",

      });

    }

  };