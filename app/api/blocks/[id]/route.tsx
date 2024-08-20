// app/api/blocks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Block from "@/models/Block";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const blockId = params.id;
    const { taskId } = await request.json();
    console.log("blockId", blockId);
    console.log("taskId", taskId);

    if (!taskId) {
      return NextResponse.json(
        { message: "taskId is required" },
        { status: 400 }
      );
    }

    // Update the task with the block reference
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: { block: blockId } },
      { new: true, runValidators: true }
    );

    console.log("updatedTask", updatedTask);

    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Add the task to the block's tasks array
    const updatedBlock = await Block.findByIdAndUpdate(
      blockId,
      { $addToSet: { tasks: taskId } },
      { new: true }
    );

    if (!updatedBlock) {
      return NextResponse.json({ message: "Block not found" }, { status: 404 });
    }

    return NextResponse.json({ updatedTask, updatedBlock }, { status: 200 });
  } catch (error) {
    console.error("Error adding task to block:", error);
    return NextResponse.json(
      { message: "Error adding task to block", error },
      { status: 500 }
    );
  }
}
