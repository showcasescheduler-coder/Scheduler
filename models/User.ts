import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  days: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    imageUrl: { type: String },
    days: [{ type: Schema.Types.ObjectId, ref: "Day" }],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
