import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  userId: string;
  name: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  block?: mongoose.Types.ObjectId;
  priority?: string;
  isRecurring?: boolean;
  days?: string[];
  meetingLink?: string;
  completed: boolean;
  tasks: mongoose.Types.ObjectId[];
  eventType?: string; // Add this line to include the eventType in the interface
}

// Create a schema for the event instance
const EventInstanceSchema = new Schema({
  date: { type: Date, required: true },
  blockId: {
    type: Schema.Types.ObjectId,
    ref: "Block",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "complete", "incomplete", "missed"],
    default: "pending",
  },
  completedAt: { type: Date },
});

const EventSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    date: { type: Date, required: false },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    block: {
      type: Schema.Types.ObjectId,
      ref: "Block",
      required: false,
    },
    priority: { type: String, enum: ["Low", "Medium", "High"] },
    isRecurring: { type: Boolean, default: false },
    days: [String],
    meetingLink: { type: String, required: false },
    completed: { type: Boolean, default: false },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    eventType: {
      type: String,
      enum: ["meeting", "personal", "health", "exercise"],
      default: "meeting",
    },
    instanceHistory: [EventInstanceSchema],
  },
  { timestamps: true }
);

if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const Event = mongoose.model<IEvent>("Event", EventSchema);

export default Event;
