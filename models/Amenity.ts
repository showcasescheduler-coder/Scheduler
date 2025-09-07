// models/Amenity.js
import mongoose from "mongoose";

const AmenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Amenity ||
  mongoose.model("Amenity", AmenitySchema);
