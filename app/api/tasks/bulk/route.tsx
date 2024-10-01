import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Project from "@/models/Project";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { tasks, projectId } = await request.json();

    // Create tasks
    const createdTasks = await Task.insertMany(tasks);

    // Update project with new task IDs
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: { $each: createdTasks.map((task: any) => task._id) } },
    });

    return NextResponse.json({ tasks: createdTasks });
  } catch (error) {
    console.error("Error saving tasks:", error);
    return NextResponse.json(
      { error: "Failed to save tasks" },
      { status: 500 }
    );
  }
}
