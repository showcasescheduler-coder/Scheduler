import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Project from "@/models/Project";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    // Parse the incoming JSON data
    const body = await request.json();
    const { projectId, ...taskData } = body;

    // Log the received data
    console.log("Received task data:", body);
    console.log(projectId, taskData);

    // // Create the new task
    const task = new Task({ ...taskData, project: projectId });
    await task.save();

    // Add the task to the project's tasks array
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });

    // Return a success message along with the received data
    return NextResponse.json(
      {
        message: "Task created successfully",
        task: task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        error: "Error creating task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    console.log("Fetching standalone tasks...");
    // Find all tasks where project and routine fields are null or undefined
    const standaloneTasks = await Task.find({
      $and: [
        { project: { $in: [null, undefined] } },
        { routine: { $in: [null, undefined] } },
      ],
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    return NextResponse.json(standaloneTasks);
  } catch (error) {
    console.error("Error fetching standalone tasks:", error);
    return NextResponse.json(
      { error: "Error fetching standalone tasks" },
      { status: 500 }
    );
  }
}
