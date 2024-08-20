import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Block from "@/models/Block";
import Day from "@/models/Day";
import Task from "@/models/Task"; // Add this line
import Project from "@/models/Project"; // Add this if you have a Project model
import Routine from "@/models/Routine";

const models = { Block, Day, Task, Project, Routine };

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { dayId, ...blockData } = body;

    console.log("dayId", dayId);
    console.log("blockData", blockData);

    const day = await Day.findById(dayId);
    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    const block = new Block({
      ...blockData,
      dayId,
    });
    await block.save();
    day.blocks.push(block._id);
    await day.save();
    const populatedBlock = await Block.findById(block._id).populate("tasks");
    return NextResponse.json(populatedBlock, { status: 201 });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Error creating block" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedBlock = await Block.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { error: "Error updating block" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();

  try {
    const { id, dayId } = await request.json();

    await Block.findByIdAndDelete(id);
    await Day.findByIdAndUpdate(dayId, { $pull: { blocks: id } });

    return NextResponse.json({ message: "Block deleted successfully" });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { error: "Error deleting block" },
      { status: 500 }
    );
  }
}
