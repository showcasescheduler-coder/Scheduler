import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Day from "@/models/Day";
import User from "@/models/User";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const userId = request.nextUrl.searchParams.get("userId");
    console.log("this is the start of try2");
    console.log("userId", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    console.log("user", user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    let day = await Day.findOne({ user: userId, date: today }).populate({
      path: "blocks",
      populate: { path: "tasks" },
    });

    if (!day) {
      day = new Day({
        user: userId,
        date: today,
        completed: false,
        blocks: [],
        completedTasksCount: 0,
        performanceRating: {
          level: "Not Rated",
          score: 0,
          comment: "Your day hasn't been rated yet.",
        },
      });
      await day.save();

      // Add the day to the user's days array
      user.days.push(day._id);
      await user.save();
    }

    return NextResponse.json(day);
  } catch (error) {
    console.error("Error fetching or creating today's day:", error);
    return NextResponse.json(
      { error: "Error fetching or creating today's day" },
      { status: 500 }
    );
  }
}
