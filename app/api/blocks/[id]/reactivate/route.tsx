import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Day from "@/models/Day";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const blockId = params.id;

    // Find the block and update its status
    const block = await Block.findByIdAndUpdate(
      blockId,
      { status: "pending" },
      { new: true }
    );

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    // Find the day containing this block and update its completedBlocksCount
    const day = await Day.findOne({ blocks: blockId });
    if (day) {
      day.completedBlocksCount = (day.completedBlocksCount || 0) - 1;
      await day.save();
    }

    return NextResponse.json({
      message: "Block reactivated successfully",
      block,
    });
  } catch (error) {
    console.error("Error reactivating block:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
