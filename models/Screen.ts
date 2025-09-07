// models/Screen.js
import mongoose from "mongoose";

const ScreenSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
ScreenSchema.index({ siteId: 1, name: 1 });

export default mongoose.models.Screen || mongoose.model("Screen", ScreenSchema);
