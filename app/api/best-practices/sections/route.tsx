// app/api/best-practices/sections/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Section from "@/models/Section";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Section name is required" },
        { status: 400 }
      );
    }

    const section = new Section({ name });
    await section.save();

    return NextResponse.json({ success: true, section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create section" },
      { status: 500 }
    );
  }
}
