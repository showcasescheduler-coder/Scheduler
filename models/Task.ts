import mongoose from "mongoose";

export interface ITask {
  _id?: string;
  name: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  deadline?: Date;
  duration?: string;
  status?: "Todo" | "In Progress" | "Completed";
  project?: mongoose.Types.ObjectId;
  routine?: mongoose.Types.ObjectId;
  block?: mongoose.Types.ObjectId;
}

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    deadline: { type: Date },
    duration: { type: String },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed"],
      default: "Todo",
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    routine: { type: mongoose.Schema.Types.ObjectId, ref: "Routine" },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
  },
  { timestamps: true, strict: false }
);

// Delete the model if it's already defined
if (mongoose.models.Task) {
  delete mongoose.models.Task;
}

// Create and export the model
const Task = mongoose.model("Task", TaskSchema);
export default Task;
