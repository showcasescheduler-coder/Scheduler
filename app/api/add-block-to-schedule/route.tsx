// app/api/add-block-to-schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Day from "@/models/Day";
import Block from "@/models/Block";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { dayId, name, startTime, endTime, userId } = await request.json();

    if (!dayId || !name || !startTime || !endTime || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the new block
    const newBlock = new Block({
      name,
      startTime,
      endTime,
      dayId,
      userId,
      status: "pending",
    });

    await newBlock.save();

    // Add the block to the day
    await Day.findByIdAndUpdate(dayId, { $push: { blocks: newBlock._id } });

    return NextResponse.json(
      {
        success: true,
        message: "Block added to schedule successfully",
        block: newBlock,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding block to schedule:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding block to schedule",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
