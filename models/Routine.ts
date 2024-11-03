import mongoose from "mongoose";

const RoutineSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    days: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export default mongoose.models.Routine ||
  mongoose.model("Routine", RoutineSchema);
