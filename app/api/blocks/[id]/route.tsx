// app/api/blocks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Task from "@/models/Task";
import Block from "@/models/Block";
import Day from "@/models/Day";
import Event from "@/models/Event";

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

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();

//   try {
//     const blockId = params.id;
//     const updateData = await request.json();

//     // Remove _id from updateData if it exists, as we shouldn't update the _id
//     delete updateData._id;

//     // Update the block with all provided fields
//     const updatedBlock = await Block.findByIdAndUpdate(
//       blockId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).populate({
//       path: "tasks",
//       model: Task,
//       select:
//         "name description duration priority completed isRoutineTask projectId deadline",
//     });

//     if (!updatedBlock) {
//       return NextResponse.json({ message: "Block not found" }, { status: 404 });
//     }

//     return NextResponse.json({ updatedBlock }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating block:", error);
//     return NextResponse.json(
//       { message: "Error updating block", error },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const blockId = params.id;
    const updateData = await request.json();

    // Remove _id from updateData if it exists, as we shouldn't update the _id
    delete updateData._id;

    // Update the block with all provided fields
    const updatedBlock = await Block.findByIdAndUpdate(
      blockId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: "tasks",
        model: Task,
        select:
          "name description duration priority completed isRoutineTask projectId deadline",
      })
      .populate("event");

    if (!updatedBlock) {
      return NextResponse.json({ message: "Block not found" }, { status: 404 });
    }

    // If this is an event block and we're marking it as complete,
    // update the associated event
    if (updatedBlock.event && updateData.status === "complete") {
      const event = updatedBlock.event;

      // Handle recurring vs. one-time events differently
      if (event.isRecurring) {
        // For recurring events, add this instance to the history
        const today = new Date();
        await Event.findByIdAndUpdate(
          event._id,
          {
            $push: {
              instanceHistory: {
                date: today,
                blockId: blockId,
                status: "complete",
                completedAt: today,
              },
            },
          },
          { new: true }
        );
      } else {
        // For one-time events, mark the event itself as completed
        await Event.findByIdAndUpdate(
          event._id,
          { completed: true },
          { new: true }
        );
      }
    }

    return NextResponse.json({ updatedBlock }, { status: 200 });
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { message: "Error updating block", error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const blockId = params.id;

    // Find the block and populate its tasks
    const block = await Block.findById(blockId).populate("tasks");
    if (!block) {
      return NextResponse.json({ message: "Block not found" }, { status: 404 });
    }

    // Check if the block truly has no tasks
    if (block.tasks && block.tasks.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete block with tasks. Remove all tasks first." },
        { status: 400 }
      );
    }

    // If the block exists and has no tasks, delete it
    const deletedBlock = await Block.findByIdAndDelete(blockId);

    if (!deletedBlock) {
      return NextResponse.json({ message: "Block not found" }, { status: 404 });
    }

    // Optionally, update any references to this block in other collections
    // For example, remove this block from the day's blocks array
    await Day.updateMany({ blocks: blockId }, { $pull: { blocks: blockId } });

    return NextResponse.json(
      { message: "Block deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { message: "Error deleting block", error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const blockId = params.id;
    const { action, taskId } = await request.json();

    if (action === "removeTask") {
      if (!taskId) {
        return NextResponse.json(
          { message: "taskId is required" },
          { status: 400 }
        );
      }

      // Find the block and remove the task from its tasks array
      const updatedBlock = await Block.findByIdAndUpdate(
        blockId,
        { $pull: { tasks: taskId } },
        { new: true }
      );

      if (!updatedBlock) {
        return NextResponse.json(
          { message: "Block not found" },
          { status: 404 }
        );
      }

      // Find the task and remove the block reference
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $unset: { block: "" } },
        { new: true }
      );

      if (!updatedTask) {
        return NextResponse.json(
          { message: "Task not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ updatedBlock, updatedTask }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { message: "Error updating block", error },
      { status: 500 }
    );
  }
}
