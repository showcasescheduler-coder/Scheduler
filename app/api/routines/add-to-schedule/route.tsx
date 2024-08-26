import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Task from "@/models/Task";
import Day from "@/models/Day"; // Import the Day model
import { ITask } from "@/models/Task";

interface AddRoutineRequestBody {
  dayId: string;
  routineId: string;
  name: string;
  startTime: string;
  endTime: string;
  tasks: Omit<ITask, "blockId">[];
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body: AddRoutineRequestBody = await request.json();
    const { dayId, routineId, name, startTime, endTime, tasks } = body;

    console.log("Add routine to schedule:", body);

    // Create the new block
    const block = await Block.create({
      dayId,
      name,
      startTime,
      endTime,
      routineId,
    });

    // Create new tasks based on the routine's tasks
    const tasksToCreate = tasks.map((task) => ({
      name: task.name,
      priority: task.priority,
      duration: task.duration,
      blockId: block._id,
      // Add any other relevant fields, but exclude _id
    }));

    const createdTasks = await Task.insertMany(tasksToCreate);

    console.log("tasks created:", createdTasks);

    // Update the block with the created tasks
    block.tasks = createdTasks.map((task) => task._id);
    await block.save();

    // Update the Day document to include the new block
    await Day.findByIdAndUpdate(
      dayId,
      { $push: { blocks: block._id } },
      { new: true }
    );

    return NextResponse.json({ block, tasks: createdTasks }, { status: 201 });
  } catch (error) {
    console.error("Error adding routine to schedule:", error);
    return NextResponse.json(
      { message: "Error adding routine to schedule" },
      { status: 500 }
    );
  }
}
