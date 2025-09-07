// models/SectionItem.js
import mongoose from "mongoose";

const SectionItemSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SectionItem =
  mongoose.models.SectionItem ||
  mongoose.model("SectionItem", SectionItemSchema);

export default SectionItem;
