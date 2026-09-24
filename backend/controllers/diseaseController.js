const Disease = require("../models/Disease");


// ============================================
// GET ALL DISEASES
// ============================================

exports.getAllDiseases = async (req, res) => {

  try {

    const diseases = await Disease.find({
      isActive: true,
    })
      .sort({
        name: 1,
      });


    return res.status(200).json({

      success: true,

      count: diseases.length,

      data: diseases,

    });

  } catch (error) {

    console.error(
      "Get Diseases Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ============================================
// GET DISEASE BY ID
// ============================================

exports.getDiseaseById = async (req, res) => {

  try {

    const disease =
      await Disease.findById(
        req.params.id
      );


    if (!disease) {

      return res.status(404).json({

        success: false,

        message:
          "Disease not found",

      });

    }


    return res.status(200).json({

      success: true,

      data: disease,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ============================================
// CREATE DISEASE
// ADMIN ONLY
// ============================================

exports.createDisease = async (req, res) => {

  try {

    const {
      name,
      category,
      description,
      transmission_type,
      incubation_period,
      symptoms,
      prevention,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name || !category) {

      return res.status(400).json({

        success: false,

        message:
          "Name and category are required",

      });

    }


    // ==========================================
    // CHECK EXISTING DISEASE
    // ==========================================

    const existingDisease =
      await Disease.findOne({

        name: {

          $regex:
            new RegExp(
              `^${name}$`,
              "i"
            ),

        },

      });


    if (existingDisease) {

      return res.status(409).json({

        success: false,

        message:
          "Disease already exists",

      });

    }


    // ==========================================
    // CREATE DISEASE
    // ==========================================

    const disease =
      await Disease.create({

        name,

        category,

        description:
          description || "",

        transmission_type:
          transmission_type || "OTHER",

        incubation_period:
          incubation_period || "",

        symptoms:
          symptoms || [],

        prevention:
          prevention || [],

        isActive:
          true,

      });


    return res.status(201).json({

      success: true,

      message:
        "Disease created successfully",

      data: disease,

    });

  } catch (error) {

    console.error(
      "Create Disease Error:",
      error
    );

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};


// ============================================
// UPDATE DISEASE
// ADMIN ONLY
// ============================================

exports.updateDisease = async (req, res) => {

  try {

    const disease =
      await Disease.findByIdAndUpdate(

        req.params.id,

        req.body,

        {

          new: true,

          runValidators: true,

        }

      );


    if (!disease) {

      return res.status(404).json({

        success: false,

        message:
          "Disease not found",

      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Disease updated successfully",

      data: disease,

    });

  } catch (error) {

    console.error(
      "Update Disease Error:",
      error
    );

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};


// ============================================
// DELETE DISEASE
// SOFT DELETE
// ADMIN ONLY
// ============================================

exports.deleteDisease = async (req, res) => {

  try {

    const disease =
      await Disease.findByIdAndUpdate(

        req.params.id,

        {

          isActive:
            false,

        },

        {

          new:
            true,

        }

      );


    if (!disease) {

      return res.status(404).json({

        success: false,

        message:
          "Disease not found",

      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Disease deleted successfully",

    });

  } catch (error) {

    console.error(
      "Delete Disease Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ============================================
// SEARCH DISEASES
// GET /api/diseases/search?name=Dengue
// GET /api/diseases/search?category=Viral
// ============================================

exports.searchDiseases = async (req, res) => {

  try {

    const {
      name,
      category,
    } = req.query;


    let filter = {

      isActive:
        true,

    };


    // ==========================================
    // SEARCH BY NAME
    // ==========================================

    if (name) {

      filter.name = {

        $regex:
          name,

        $options:
          "i",

      };

    }


    // ==========================================
    // SEARCH BY CATEGORY
    // ==========================================

    if (category) {

      filter.category = {

        $regex:
          category,

        $options:
          "i",

      };

    }


    const diseases =
      await Disease.find(filter)
        .sort({

          name:
            1,

        });


    return res.status(200).json({

      success:
        true,

      count:
        diseases.length,

      data:
        diseases,

    });

  } catch (error) {

    console.error(
      "Search Diseases Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        error.message,

    });

  }

};