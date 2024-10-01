import mongoose from "mongoose";
import Block from "@/models/Block"; // Import your models
import Day from "@/models/Day";
import Task from "@/models/Task";
import User from "@/models/User";
import Event from "@/models/Event";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: Cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      // Explicitly compile models
      mongoose.model("Block", Block.schema);
      mongoose.model("Day", Day.schema);
      mongoose.model("Task", Task.schema);
      mongoose.model("User", User.schema);
      mongoose.model("Event", Event.schema);

      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
