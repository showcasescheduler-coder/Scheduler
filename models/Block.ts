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
  routineId?: mongoose.Types.ObjectId; // Added routineId field
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  meetingLink?: string; // Add optional meeting link field
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
    routineId: {
      // Added routineId field
      type: Schema.Types.ObjectId,
      ref: "Routine",
      default: null,
      required: false,
    },
    blockType: {
      type: String,
      enum: [
        "deep-work",
        "break",
        "meeting",
        "health",
        "exercise",
        "admin",
        "personal",
      ],
      required: false,
    },
    meetingLink: {
      type: String,
      required: false,
      trim: true, // Remove whitespace from both ends of the string
    },
  },
  { timestamps: true }
);

const Block =
  mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

export default Block;
