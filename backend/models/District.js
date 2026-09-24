const mongoose = require("mongoose");

// ── District Model ────────────────────────────────────────
const districtSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    region: {
        type: String,
        trim: true,
        default: "Tamil Nadu"
    },

    population: {
        type: Number,
        default: 0,
        min: 0
    },

    hospitals: {
        type: Number,
        default: 0,
        min: 0
    },

    phcs: {
        type: Number,
        default: 0,
        min: 0
    },

    lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },

    lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },

    risk_level: {
        type: String,
        enum: [
            "LOW",
            "MEDIUM",
            "HIGH"
        ],
        default: "LOW"
    },

    active_alerts: {
        type: Number,
        default: 0,
        min: 0
    }
},
{
    timestamps: true
}
);

// Indexes
districtSchema.index({ name: 1 });
districtSchema.index({ risk_level: 1 });

// Export Model
module.exports = mongoose.model(
    "District",
    districtSchema
);