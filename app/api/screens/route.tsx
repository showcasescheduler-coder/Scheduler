import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Screen from "@/models/Screen";
import Site from "@/models/Site";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");
    
    let query = {};
    if (siteId) {
      query = { siteId };
    }
    
    const screens = await Screen.find(query).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      screens,
    });
  } catch (error) {
    console.error("Error fetching screens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { siteId, name, capacity, type, features, status } = body;

    if (!siteId || !name || !capacity) {
      return NextResponse.json(
        { success: false, error: "Site ID, name, and capacity are required" },
        { status: 400 }
      );
    }

    // Verify site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    const screen = new Screen({
      siteId,
      name,
      capacity,
      type: type || "Standard",
      features: features || [],
      status: status || "active",
    });

    await screen.save();

    // Add screen to site's screens array
    site.screens.push(screen._id);
    await site.save();

    return NextResponse.json(
      {
        success: true,
        screen,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating screen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create screen" },
      { status: 500 }
    );
  }
}