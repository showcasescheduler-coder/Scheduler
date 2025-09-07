// app/api/sites/[id]/screens/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Site from "@/models/Site";
import Screen from "@/models/Screen";
import mongoose from "mongoose";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const siteId = params.id;
    const body = await request.json();

    const { name, capacity, features } = body;

    if (!name || !capacity) {
      return NextResponse.json(
        { success: false, error: "Screen name and capacity are required" },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    // Create the screen
    const screen = new Screen({
      siteId: new mongoose.Types.ObjectId(siteId), // Keep siteId for reverse lookup
      name,
      capacity,
      features: features || [],
    });

    await screen.save();

    // Add screen to site's screens array
    await Site.findByIdAndUpdate(
      siteId,
      { $push: { screens: screen._id } },
      { new: true }
    );

    return NextResponse.json({ success: true, screen }, { status: 201 });
  } catch (error) {
    console.error("Error creating screen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create screen" },
      { status: 500 }
    );
  }
}
