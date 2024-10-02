import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import { use } from "react";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const { userId, ...taskData } = body;

    console.log("Received standalone task data:", body);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create the task object, only including blockId if it's provided
    const taskToCreate = {
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority,
      duration: taskData.duration,
      deadline: taskData.deadline,
      userId: userId,
    };

    const task = new Task(taskToCreate);
    await task.save();

    return NextResponse.json(
      {
        message: "Standalone task created successfully",
        task: task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating standalone task:", error);
    return NextResponse.json(
      {
        error: "Error creating standalone task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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

    console.log("Fetching standalone tasks for user:", userId);
    const standaloneTasks = await Task.find({
      userId: userId,
      isRoutineTask: false,
      projectId: null,
    }).sort({ createdAt: -1 });

    return NextResponse.json(standaloneTasks);
  } catch (error) {
    console.error("Error fetching standalone tasks:", error);
    return NextResponse.json(
      { error: "Error fetching standalone tasks" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    console.log("Updating standalone task:", _id);
    console.log("Update data:", updateData);

    const updatedTask = await Task.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Standalone task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating standalone task:", error);
    return NextResponse.json(
      {
        error: "Error updating standalone task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();

  try {
    const taskId = request.nextUrl.searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    console.log("Deleting task with ID:", taskId);

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      {
        error: "Error deleting task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
