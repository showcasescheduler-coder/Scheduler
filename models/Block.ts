import mongoose, { Schema, Document } from "mongoose";

export interface IBlock extends Document {
  dayId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  startTime: string;
  endTime: string;
  tasks: mongoose.Types.ObjectId[];
  event?: mongoose.Types.ObjectId;
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
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
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "complete", "incomplete"],
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
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    blockType: {
      type: String,
      enum: ["deep-work", "planning", "break", "admin", "collaboration"],
      required: true,
    },
  },
  { timestamps: true }
);

const Block =
  mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

export default Block;
