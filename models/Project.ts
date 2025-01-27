import mongoose, { Document, Schema } from "mongoose";

// Interface for the Project, extending Document
export interface IProject extends Document {
  userId: string;
  name: string;
  description: string;
  deadline: Date;
  time: string;
  priority: string;
  completed: boolean; // Added completed field to interface
  order: number;
}

// Schema for the Project
const ProjectSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    time: { type: String, required: true },
    priority: { type: String, required: true, enum: ["Low", "Medium", "High"] },
    completed: { type: Boolean, required: true, default: false }, // Added completed field to schema
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    order: { type: Number, default: 9999 },
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
