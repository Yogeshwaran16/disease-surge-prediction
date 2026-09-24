const mongoose = require("mongoose");


const passwordResetTokenSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },


      tokenHash: {
        type: String,

        required: true,

        unique: true,
      },


      expiresAt: {
        type: Date,

        required: true,
      },


      isUsed: {
        type: Boolean,

        default: false,
      },

    },

    {
      timestamps: true,
    }
  );


// ============================================
// AUTO DELETE EXPIRED TOKENS
// ============================================

passwordResetTokenSchema.index(
  {
    expiresAt: 1,
  },

  {
    expireAfterSeconds: 0,
  }
);


module.exports =
  mongoose.model(
    "PasswordResetToken",
    passwordResetTokenSchema
  );