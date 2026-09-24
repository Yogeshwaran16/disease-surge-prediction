const mongoose = require("mongoose");


const diseaseCaseSchema =
  new mongoose.Schema(

    {

      district: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      disease: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      cases: {
        type: Number,
        required: true,
        min: 0,
      },

      deaths: {
        type: Number,
        default: 0,
        min: 0,
      },

      year: {
        type: Number,
        required: true,
      },

      week_number: {
        type: Number,
        required: true,
        min: 1,
        max: 53,
      },

      reported_date: {
        type: Date,
        default: Date.now,
      },

    },

    {
      timestamps: true,
    }

  );


// ============================================
// INDEXES
// ============================================

diseaseCaseSchema.index({
  district: 1,
  disease: 1,
});

diseaseCaseSchema.index({
  year: 1,
  week_number: 1,
});


module.exports =
  mongoose.model(
    "DiseaseCase",
    diseaseCaseSchema
  );