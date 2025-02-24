// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongo";
// import Block from "@/models/Block";
// import Event from "@/models/Event";
// import Day from "@/models/Day";

// export async function POST(request: Request) {
//   try {
//     await dbConnect();

//     const body = await request.json();
//     const { eventId, dayId, date } = body;

//     if (!eventId || !dayId || !date) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Fetch the event
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return NextResponse.json(
//         { success: false, error: "Event not found" },
//         { status: 404 }
//       );
//     }

//     // Create the block
//     const block = new Block({
//       dayId,
//       name: event.name,
//       startTime: event.startTime,
//       endTime: event.endTime,
//       status: "pending",
//       event: eventId,
//     });
//     await block.save();

//     // Add the block to the day
//     await Day.findByIdAndUpdate(dayId, { $push: { blocks: block._id } });

//     // Update the event with the block ID
//     await Event.findByIdAndUpdate(eventId, { block: block._id });

//     return NextResponse.json(
//       { success: true, block: block, event: event },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating block for event:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Error creating block for event",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Task from "@/models/Task";
import Event from "@/models/Event";
import Day from "@/models/Day";

interface AddEventToBlockRequestBody {
  eventId: string;
  dayId: string;
  date: string;
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body: AddEventToBlockRequestBody = await request.json();
    const { eventId, dayId, date } = body;

    if (!eventId || !dayId || !date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the event and populate its tasks
    const event = await Event.findById(eventId).populate("tasks");
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Create the new block for the event
    const block = new Block({
      dayId,
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      status: "pending",
      event: eventId,
    });
    await block.save();

    // Create new tasks for the block based on the event's tasks.
    // This copies over each task's name, description, priority, duration, type, etc.
    const tasksToCreate = (event.tasks || []).map((task: any) => ({
      name: task.name,
      description: task.description,
      priority: task.priority,
      duration: task.duration,
      blockId: block._id,
      eventId: eventId,
      type: task.type || "default", // adjust as needed
      completed: false,
    }));

    const createdTasks = await Task.insertMany(tasksToCreate);

    // Update the block with the new task IDs
    block.tasks = createdTasks.map((task) => task._id);
    await block.save();

    // Update the Day document to include the new block
    await Day.findByIdAndUpdate(dayId, { $push: { blocks: block._id } });

    // Optionally, update the Event with the block reference
    await Event.findByIdAndUpdate(eventId, { block: block._id });

    return NextResponse.json(
      { success: true, block, tasks: createdTasks },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding event to block:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error adding event to block",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
