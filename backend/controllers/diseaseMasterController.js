const Disease = require("../models/Disease");


// ============================================
// CREATE DISEASE
// ============================================

exports.createDisease = async (req, res) => {

  try {

    const {
      name,
      category,
      type,
      description,
      symptoms,
      seasonalMonths,
    } = req.body;


    // VALIDATION

    if (!name || !category) {

      return res.status(400).json({
        success: false,
        message:
          "Disease name and category are required.",
      });

    }


    // CHECK DUPLICATE

    const existingDisease =
      await Disease.findOne({
        name: name.trim(),
      });


    if (existingDisease) {

      return res.status(409).json({
        success: false,
        message:
          "Disease already exists.",
      });

    }


    // CREATE

    const disease =
      await Disease.create({

        name: name.trim(),

        category,

        type,

        description,

        symptoms:
          symptoms || [],

        seasonalMonths:
          seasonalMonths || [],

      });


    return res.status(201).json({

      success: true,

      message:
        "Disease created successfully.",

      data:
        disease,

    });

  } catch (error) {

    console.error(
      "Create Disease Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};


// ============================================
// GET ALL DISEASES
// ============================================

exports.getDiseases =
  async (req, res) => {

    try {

      const diseases =
        await Disease.find()
          .sort({
            name: 1,
          });


      return res.status(200).json({

        success: true,

        count:
          diseases.length,

        data:
          diseases,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ============================================
// GET SINGLE DISEASE
// ============================================

exports.getDiseaseById =
  async (req, res) => {

    try {

      const disease =
        await Disease.findById(
          req.params.id
        );


      if (!disease) {

        return res.status(404).json({

          success: false,

          message:
            "Disease not found.",

        });

      }


      return res.status(200).json({

        success: true,

        data:
          disease,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ============================================
// UPDATE DISEASE
// ============================================

exports.updateDisease =
  async (req, res) => {

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
            "Disease not found.",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Disease updated successfully.",

        data:
          disease,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ============================================
// DELETE DISEASE
// ============================================

exports.deleteDisease =
  async (req, res) => {

    try {

      const disease =
        await Disease.findByIdAndDelete(
          req.params.id
        );


      if (!disease) {

        return res.status(404).json({

          success: false,

          message:
            "Disease not found.",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Disease deleted successfully.",

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };