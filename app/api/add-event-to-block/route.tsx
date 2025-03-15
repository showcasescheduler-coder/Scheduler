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
  isRecurringInstance: boolean;
  meetingLink?: string;
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body: AddEventToBlockRequestBody = await request.json();
    const { eventId, dayId, date, isRecurringInstance } = body;

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

    console.log("this is the event.", event);

    // Format the date for display (MM/DD/YY format)
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });

    // Create a name for the block based on whether it's a recurring instance
    let blockName = event.name;
    if (isRecurringInstance) {
      blockName = `${event.name} • ${formattedDate}`;
    }

    // Create the new block for the event
    const block = new Block({
      dayId,
      name: blockName,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      status: "pending",
      event: eventId,
      blockType: event.eventType || "meeting", // Use eventType from event or default to meeting
      meetingLink: body.meetingLink || event.meetingLink,
      isRecurringInstance: isRecurringInstance || false,
      originalEventName: event.name, // Store original name for reference
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

    // Only update the Event with the block reference if it's not a recurring instance
    if (!isRecurringInstance) {
      await Event.findByIdAndUpdate(eventId, { block: block._id });
    }

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
