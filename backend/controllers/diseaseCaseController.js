const DiseaseCase =
  require("../models/DiseaseCase");


// ============================================
// CREATE DISEASE CASE
// ============================================

exports.createDiseaseCase =
  async (req, res) => {

    try {

      const {
        district,
        disease,
        cases,
        deaths,
        year,
        week_number,
        reported_date,
      } = req.body;


      if (
        !district ||
        !disease ||
        cases === undefined ||
        !year ||
        !week_number
      ) {

        return res.status(400).json({
          success: false,
          message:
            "District, disease, cases, year and week_number are required",
        });

      }


      let finalDistrict =
        district;


      // Health Officer → own district only

      if (
        req.user.role ===
        "health_officer"
      ) {

        finalDistrict =
          req.user.district;

      }


      const diseaseCase =
        await DiseaseCase.create({

          district:
            finalDistrict,

          disease,

          cases:
            Number(cases),

          deaths:
            Number(deaths || 0),

          year:
            Number(year),

          week_number:
            Number(week_number),

          reported_date:
            reported_date ||
            new Date(),

        });


      return res.status(201).json({

        success: true,

        message:
          "Disease case created successfully",

        data:
          diseaseCase,

      });

    } catch (error) {

      console.error(
        "Create Disease Case Error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ============================================
// GET ALL DISEASE CASES
// ============================================

exports.getAllDiseaseCases =
  async (req, res) => {

    try {

      let filter = {};


      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const diseaseCases =
        await DiseaseCase.find(filter)
          .sort({
            year: -1,
            week_number: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          diseaseCases.length,

        data:
          diseaseCases,

      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };


// ============================================
// GET DISEASE CASE BY ID
// ============================================

exports.getDiseaseCaseById =
  async (req, res) => {

    try {

      let filter = {
        _id: req.params.id,
      };


      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const diseaseCase =
        await DiseaseCase.findOne(filter);


      if (!diseaseCase) {

        return res.status(404).json({
          success: false,
          message:
            "Disease case not found or access denied",
        });

      }


      return res.status(200).json({
        success: true,
        data: diseaseCase,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };


// ============================================
// UPDATE DISEASE CASE
// ============================================

exports.updateDiseaseCase =
  async (req, res) => {

    try {

      let filter = {
        _id: req.params.id,
      };


      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

        delete req.body.district;

      }


      const diseaseCase =
        await DiseaseCase.findOneAndUpdate(

          filter,

          req.body,

          {
            new: true,
            runValidators: true,
          }

        );


      if (!diseaseCase) {

        return res.status(404).json({
          success: false,
          message:
            "Disease case not found or access denied",
        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Disease case updated successfully",

        data:
          diseaseCase,

      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  };


// ============================================
// DELETE DISEASE CASE
// ============================================

exports.deleteDiseaseCase =
  async (req, res) => {

    try {

      let filter = {
        _id: req.params.id,
      };


      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }


      const diseaseCase =
        await DiseaseCase.findOneAndDelete(
          filter
        );


      if (!diseaseCase) {

        return res.status(404).json({
          success: false,
          message:
            "Disease case not found or access denied",
        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Disease case deleted successfully",

      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };


// ============================================
// SEARCH DISEASE CASES
// ============================================

exports.searchDiseaseCases =
  async (req, res) => {

    try {

      const {
        district,
        disease,
        year,
      } = req.query;


      let filter = {};


      if (
        req.user.role ===
        "health_officer"
      ) {

        filter.district =
          req.user.district;

      }

      else if (district) {

        filter.district = {
          $regex: district,
          $options: "i",
        };

      }


      if (disease) {

        filter.disease = {
          $regex: disease,
          $options: "i",
        };

      }


      if (year) {

        filter.year =
          Number(year);

      }


      const diseaseCases =
        await DiseaseCase.find(filter)
          .sort({
            year: -1,
            week_number: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          diseaseCases.length,

        data:
          diseaseCases,

      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };


// ============================================
// DASHBOARD STATISTICS
// ============================================

exports.getDashboardStats =
  async (req, res) => {

    try {

      let match = {};


      if (
        req.user.role ===
        "health_officer"
      ) {

        match.district =
          req.user.district;

      }


      const totals =
        await DiseaseCase.aggregate([

          {
            $match: match,
          },

          {
            $group: {

              _id: null,

              totalCases: {
                $sum: "$cases",
              },

              totalDeaths: {
                $sum: "$deaths",
              },

            },

          },

        ]);


      const diseaseWise =
        await DiseaseCase.aggregate([

          {
            $match: match,
          },

          {
            $group: {

              _id: "$disease",

              totalCases: {
                $sum: "$cases",
              },

              totalDeaths: {
                $sum: "$deaths",
              },

            },

          },

          {
            $sort: {
              totalCases: -1,
            },

          },

        ]);


      return res.status(200).json({

        success: true,

        summary: {

          total_cases:
            totals[0]?.totalCases || 0,

          total_deaths:
            totals[0]?.totalDeaths || 0,

        },

        disease_wise:
          diseaseWise,

      });

    } catch (error) {

      console.error(
        "Dashboard Statistics Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };