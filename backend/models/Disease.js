const mongoose = require("mongoose");


const diseaseSchema =
  new mongoose.Schema(
    {

      name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },


      category: {
        type: String,
        required: true,
        trim: true,
      },


      description: {
        type: String,
        default: "",
      },


      transmission_type: {
        type: String,
        enum: [
          "VECTOR",
          "AIRBORNE",
          "WATERBORNE",
          "CONTACT",
          "FOODBORNE",
          "OTHER",
        ],
        default: "OTHER",
      },


      incubation_period: {
        type: String,
        default: "",
      },


      symptoms: {
        type: [String],
        default: [],
      },


      prevention: {
        type: [String],
        default: [],
      },


      isActive: {
        type: Boolean,
        default: true,
      },

    },

    {
      timestamps: true,
    }

  );


// ============================================
// INDEXES
// ============================================

diseaseSchema.index({
  name: 1,
});

diseaseSchema.index({
  category: 1,
});

diseaseSchema.index({
  isActive: 1,
});


// ============================================
// EXPORT MODEL
// ============================================

module.exports =
  mongoose.model(
    "Disease",
    diseaseSchema
  );