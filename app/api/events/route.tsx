import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Event from "@/models/Event";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { userId, ...eventData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const event = new Event({ ...eventData, userId });
    await event.save();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const events = await Event.find({ userId }).sort({ date: 1 }); // Sort by date ascending
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    );
  }
}
