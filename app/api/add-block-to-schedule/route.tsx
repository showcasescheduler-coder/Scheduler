// app/api/add-block-to-schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Day from "@/models/Day";
import Block from "@/models/Block";

export async function POST(request: NextRequest) {
  console.log("did this even load");
  await dbConnect();

  try {
    const { dayId, name, startTime, endTime, userId, description, blockType } =
      await request.json();

    if (!dayId || !name || !startTime || !endTime || !userId) {
      console.log("missing the required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("this loaded? part two");

    // Create the new block
    const newBlock = new Block({
      name,
      startTime,
      endTime,
      dayId,
      userId,
      status: "pending",
      blockType,
      description,
    });

    console.log("this is the new block", newBlock);

    await newBlock.save();

    console.log(newBlock);
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
