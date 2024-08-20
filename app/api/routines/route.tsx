import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Routine from "@/models/Routine";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const routine = new Routine(body);
    await routine.save();

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error("Error creating routine:", error);
    return NextResponse.json(
      { error: "Error creating routine" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const routines = await Routine.find({}).sort({ createdAt: -1 }).populate({
      path: "tasks",
      model: "Task",
      select: "name time duration priority", // Add or remove fields as needed
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
