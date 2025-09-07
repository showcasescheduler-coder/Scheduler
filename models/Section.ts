// models/Section.js
import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Section =
  mongoose.models.Section || mongoose.model("Section", SectionSchema);

export default Section;
