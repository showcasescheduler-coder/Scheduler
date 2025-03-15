import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Routine from "@/models/Routine";
import Task from "@/models/Task"; // Import the Task model

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    console.log("Received routine data:", body);

    const {
      name,
      description,
      days,
      block,
      userId,
      startTime,
      endTime,
      blockType,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const newRoutine = new Routine({
      name,
      description,
      days,
      block,
      userId,
      startTime,
      endTime,
      blockType, // Add the blockType field here
    });

    await newRoutine.save();

    console.log("Created routine:", newRoutine);

    return NextResponse.json(newRoutine, { status: 201 });
  } catch (error) {
    console.error("Error creating routine:", error);

    let errorMessage = "Error creating routine";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Error creating routine", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const routines = await Routine.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "tasks",
        model: Task,
      });

    return NextResponse.json(routines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json(
      { error: "Error fetching routines" },
      { status: 500 }
    );
  }
}
