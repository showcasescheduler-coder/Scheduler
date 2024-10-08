import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  userId: string;
  name: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  block?: mongoose.Types.ObjectId; // Make block optional
  priority?: string;
  isRecurring?: boolean;
  days?: string[];
}

const EventSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: false },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    block: {
      type: Schema.Types.ObjectId,
      ref: "Block",
      required: false, // Make block not required
    },
    priority: { type: String, enum: ["Low", "Medium", "High"] },
    isRecurring: { type: Boolean, default: false },
    days: [String],
  },
  { timestamps: true }
);

// Delete the model if it exists to force a reload
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const Event = mongoose.model<IEvent>("Event", EventSchema);

export default Event;
