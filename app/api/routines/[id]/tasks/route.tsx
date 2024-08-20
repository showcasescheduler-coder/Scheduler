import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Routine from "@/models/Routine";
import Task from "@/models/Task";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const routineId = params.id;
    const taskData = await request.json();

    const routine = await Routine.findById(routineId);
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    const newTask = new Task({ ...taskData, routineId });
    await newTask.save();

    routine.tasks.push(newTask._id);
    await routine.save();

    const updatedRoutine = await Routine.findById(routineId).populate("tasks");
    return NextResponse.json(updatedRoutine);
  } catch (error) {
    console.error("Error adding task to routine:", error);
    return NextResponse.json(
      { error: "Error adding task to routine" },
      { status: 500 }
    );
  }
}
