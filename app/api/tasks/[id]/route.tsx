import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Block from "@/models/Block";
import Day from "@/models/Day";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;
    const { completed, dayId, completedTasksCount } = await request.json();

    console.log("Received completedTasksCount:", completedTasksCount);

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update the day's completed tasks count and populate in a single query
    const updatedDay = await Day.findByIdAndUpdate(
      dayId,
      { $set: { completedTasksCount } },
      { new: true, runValidators: true }
    ).populate({
      path: "blocks",
      populate: {
        path: "tasks",
        model: "Task",
      },
    });

    if (!updatedDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    console.log("Updated Day:", updatedDay);

    return NextResponse.json({ updatedTask, updatedDay });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Error updating task" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;

    // Find the task
    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If the task is associated with a block, remove it from the block
    if (task.block) {
      await Block.findByIdAndUpdate(task.block, {
        $pull: { tasks: id },
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(id);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Error deleting task" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching task" },
      { status: 400 }
    );
  }
}
