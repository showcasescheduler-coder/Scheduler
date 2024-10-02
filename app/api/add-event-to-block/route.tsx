import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Event from "@/models/Event";
import Day from "@/models/Day";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { eventId, dayId, date } = body;

    if (!eventId || !dayId || !date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Create the block
    const block = new Block({
      dayId,
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      status: "pending",
      event: eventId,
    });
    await block.save();

    // Add the block to the day
    await Day.findByIdAndUpdate(dayId, { $push: { blocks: block._id } });

    // Update the event with the block ID
    await Event.findByIdAndUpdate(eventId, { block: block._id });

    return NextResponse.json(
      { success: true, block: block, event: event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating block for event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error creating block for event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
