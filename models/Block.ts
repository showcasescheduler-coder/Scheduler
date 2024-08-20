import mongoose, { Schema, Document } from "mongoose";

export interface IBlock extends Document {
  dayId: mongoose.Types.ObjectId;
  name: string;
  status: "pending" | "in_progress" | "completed";
  startTime: string;
  endTime: string;
  tasks: mongoose.Types.ObjectId[];
}

const BlockSchema: Schema = new Schema(
  {
    dayId: {
      type: Schema.Types.ObjectId,
      ref: "Day",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Block ||
  mongoose.model<IBlock>("Block", BlockSchema);
