// models/Site.js
import mongoose from "mongoose";

const OperatingHoursSchema = new mongoose.Schema(
  {
    monday: {
      open: { type: String, default: "11:00" },
      close: { type: String, default: "23:00" },
    },
    tuesday: {
      open: { type: String, default: "11:00" },
      close: { type: String, default: "23:00" },
    },
    wednesday: {
      open: { type: String, default: "11:00" },
      close: { type: String, default: "23:00" },
    },
    thursday: {
      open: { type: String, default: "11:00" },
      close: { type: String, default: "23:00" },
    },
    friday: {
      open: { type: String, default: "11:00" },
      close: { type: String, default: "23:00" },
    },
    saturday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "01:00" },
    },
    sunday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "23:00" },
    },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

const SiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    operatingHours: {
      type: OperatingHoursSchema,
      default: () => ({}),
    },
    customPrompt: {
      type: String,
      default: "",
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    // Add explicit reference to screens
    screens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Site || mongoose.model("Site", SiteSchema);
