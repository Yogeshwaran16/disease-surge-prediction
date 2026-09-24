const mongoose = require("mongoose");

const predictionSchema =
  new mongoose.Schema(
    {
      district: {
        type: String,
        required: true,
        trim: true,
      },

      disease: {
        type: String,
        required: true,
        trim: true,
      },

      year: {
        type: Number,
        required: true,
      },

      week_number: {
        type: Number,
        required: true,
      },

      surge_probability: {
        type: Number,
        required: true,
      },

      expected_cases_2w: {
        type: Number,
        required: true,
      },

      risk_level: {
        type: String,
        required: true,
        enum: [
          "HIGH",
          "MEDIUM",
          "LOW",
        ],
      },

      alert: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Prediction",
    predictionSchema
  );