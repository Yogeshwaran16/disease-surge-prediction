const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["dashboard", "email", "sms", "whatsapp"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "delivered", "failed"],
      default: "pending",
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    reference_id: {
      type: String,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },

    sent_at: {
      type: Date,
      default: null,
    },

    delivered_at: {
      type: Date,
      default: null,
    },

    last_attempt_at: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const alertSchema = new mongoose.Schema(
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
    },

    risk_level: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },

    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    english_alert: {
      type: String,
      default: null,
      trim: true,
    },

    tamil_alert: {
      type: String,
      default: null,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    deliveries: {
      type: [deliverySchema],
      default: [],
    },

    delivery_summary: {
      total_channels: {
        type: Number,
        default: 0,
      },

      delivered: {
        type: Number,
        default: 0,
      },

      failed: {
        type: Number,
        default: 0,
      },

      pending: {
        type: Number,
        default: 0,
      },

      last_attempt_at: {
        type: Date,
        default: null,
      },
    },

    issued_at: {
      type: Date,
      default: Date.now,
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    resolved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ district: 1 });
alertSchema.index({ disease: 1 });
alertSchema.index({ risk_level: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ resolved: 1 });
alertSchema.index({ "deliveries.channel": 1 });
alertSchema.index({ "deliveries.status": 1 });

module.exports = mongoose.model("Alert", alertSchema);