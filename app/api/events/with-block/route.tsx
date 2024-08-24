import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Event from "@/models/Event";
import Day from "@/models/Day";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, date, startTime, endTime, dayId, priority } =
      body;

    // Create the block
    const block = new Block({
      dayId,
      name,
      startTime,
      endTime,
      status: "pending",
    });
    await block.save();

    // Add the block to the day
    await Day.findByIdAndUpdate(dayId, { $push: { blocks: block._id } });

    // Create the event
    const event = new Event({
      name,
      description,
      date,
      startTime,
      endTime,
      block: block._id,
      priority,
    });
    await event.save();

    // Update the block with the event ID
    const updatedBlock = await Block.findByIdAndUpdate(
      block._id,
      { event: event._id },
      { new: true }
    );

    if (!updatedBlock) {
      throw new Error("Failed to update block with event ID");
    }

    return NextResponse.json(
      { success: true, block: updatedBlock, event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event with block:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error creating event with block",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
