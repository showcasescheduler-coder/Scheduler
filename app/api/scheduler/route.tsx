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
    console.log(dayId);
    console.log(schedule);
    console.log(userId);

    // Find the Day document
    let day = await Day.findOne({ _id: dayId, user: userId }).session(session);
    if (!day) {
      await session.abortTransaction();
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Remove block references from all tasks associated with this day's blocks
    await Task.updateMany(
      { dayId: day._id },
      { $unset: { blockId: 1, block: 1 } },
      { session }
    );

    // Simply clear the day's blocks array - we'll add new blocks to it
    day.blocks = [];
    await day.save({ session });
    console.log("Cleared day's blocks array");

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
        isStandaloneBlock: aiBlock.isStandaloneBlock,
        status: "pending",
        blockType: aiBlock.blockType, // The type of work this block represents
        description: aiBlock.description,
      });

      if (aiBlock.isEvent && aiBlock.eventId) {
        // Update the associated event with the new block ID
        await Event.findByIdAndUpdate(aiBlock.eventId, {
          block: block._id,
        }).session(session);
        block.event = aiBlock.eventId;
      }

      if (aiBlock.isRoutine && aiBlock.routineId) {
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
          // For routine tasks, always create new tasks based on the routine template
          task = new Task({
            dayId: day._id,
            blockId: block._id,
            name: aiTask.name,
            description: aiTask.description,
            status: "pending",
            priority: aiTask.priority,
            duration: aiTask.duration,
            isRoutineTask: true,
            type: aiTask.type, // Add the task type
          });
          await task.save({ session });
        } else {
          // For non-routine tasks, try to update existing task or create new one
          if (aiTask.id) {
            // Try to update existing task
            task = await Task.findById(aiTask.id).session(session);
          }

          if (task) {
            // Update existing task
            task.block = block._id;
            task.name = aiTask.name;
            task.description = aiTask.description;
            task.priority = aiTask.priority;
            task.duration = aiTask.duration;
            task.isRoutineTask = false;
            task.type = aiTask.type; // Add the task type to updates
            await task.save({ session });
          } else {
            // Create new task
            task = new Task({
              dayId: day._id,
              blockId: block._id,
              name: aiTask.name,
              description: aiTask.description,
              status: "pending",
              priority: aiTask.priority,
              duration: aiTask.duration,
              isRoutineTask: false,
              type: aiTask.type, // Add the task typ
            });
            await task.save({ session });
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
