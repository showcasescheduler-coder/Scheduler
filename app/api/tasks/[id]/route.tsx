import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Block from "@/models/Block";
import Day from "@/models/Day";
import Event from "@/models/Event";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;
    const { completed, dayId, eventId } = await request.json();

    console.log("Received task update request:", {
      id,
      completed,
      dayId,
      eventId,
    });

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If the task belongs to an event, fetch the event with populated tasks
    let updatedEvent = null;
    if (eventId) {
      console.log("Fetching updated event:", eventId);

      // Fetch the event with populated tasks
      updatedEvent = await Event.findById(eventId).populate("tasks");

      console.log("Event fetched successfully");
    }

    // Update the day
    const updatedDay = await Day.findById(dayId).populate({
      path: "blocks",
      populate: {
        path: "tasks",
        model: "Task",
      },
    });

    if (!updatedDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    return NextResponse.json({
      updatedTask,
      updatedDay,
      updatedEvent,
    });
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

    // Find the updated block to return its new state
    const updatedBlock = task.block ? await Block.findById(task.block) : null;

    return NextResponse.json({
      message: "Task deleted successfully",
      updatedBlock,
    });
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
