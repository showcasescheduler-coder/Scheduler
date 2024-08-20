import mongoose, { Schema, Document } from "mongoose";

export interface IDay extends Document {
  date: string;
  completed: boolean;
  blocks: mongoose.Types.ObjectId[];
}

const DaySchema: Schema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    blocks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Block",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Day || mongoose.model<IDay>("Day", DaySchema);
