import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Day from "@/models/Day";
import Block from "@/models/Block";
import Task from "@/models/Task";
import Event from "@/models/Event";
import Routine from "@/models/Routine";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dayId, schedule, userId } = await request.json();

    // Find the Day document
    let day = await Day.findOne({ _id: dayId, user: userId }).session(session);
    if (!day) {
      await session.abortTransaction();
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Array to store new block IDs
    const newBlockIds = [];

    // Process each block from the AI response
    for (const aiBlock of schedule.blocks) {
      let block = new Block({
        dayId: day._id,
        name: aiBlock.name,
        startTime: aiBlock.startTime,
        endTime: aiBlock.endTime,
        isEvent: aiBlock.isEvent,
        isRoutine: aiBlock.isRoutine,
        status: "pending",
      });

      if (aiBlock.isEvent) {
        // Update the associated event with the new block ID
        await Event.findByIdAndUpdate(aiBlock.eventId, {
          block: block._id,
        }).session(session);
        block.event = aiBlock.eventId;
      }

      if (aiBlock.isRoutine) {
        // Create a new block based on the routine template
        const routine = await Routine.findById(aiBlock.routineId).session(
          session
        );
        if (routine) {
          block.routine = routine._id;
        }
      }

      await block.save({ session });
      newBlockIds.push(block._id);

      // Process tasks for this block
      const taskIds = [];
      for (const aiTask of aiBlock.tasks) {
        let task;

        if (aiBlock.isRoutine) {
          // For routine tasks, create new tasks based on the routine template
          task = new Task({
            dayId: day._id,
            blockId: block._id,
            name: aiTask.name,
            description: aiTask.description,
            status: aiTask.status,
            priority: aiTask.priority,
            duration: aiTask.duration,
            projectId: aiTask.projectId,
            isRoutineTask: true,
          });
          await task.save({ session });
        } else {
          // For non-routine tasks, update existing tasks
          task = await Task.findByIdAndUpdate(
            aiTask.id,
            {
              blockId: block._id,
              status: aiTask.status, // Update status if changed
              // Add any other fields that might have changed
            },
            { session, new: true, upsert: false }
          );

          if (!task) {
            console.error(`Task with id ${aiTask.id} not found`);
            continue; // Skip this task if it doesn't exist
          }
        }

        taskIds.push(task._id);
      }

      // Update block's tasks array
      block.tasks = taskIds;
      await block.save({ session });
    }

    // Add new blocks to the day's blocks array
    day.blocks = [...day.blocks, ...newBlockIds];
    await day.save({ session });

    await session.commitTransaction();

    // Fetch the updated day with populated blocks and tasks
    const updatedDay = await Day.findById(dayId).populate({
      path: "blocks",
      populate: { path: "tasks" },
    });

    return NextResponse.json(updatedDay);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Error updating schedule" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
