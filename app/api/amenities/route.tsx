// app/api/amenities/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Amenity from "@/models/Amenity";

export async function GET() {
  try {
    await dbConnect();

    const amenities = await Amenity.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      amenities,
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const amenity = new Amenity({
      name,
      description,
    });

    await amenity.save();

    return NextResponse.json({ success: true, amenity }, { status: 201 });
  } catch (error) {
    console.error("Error creating amenity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create amenity" },
      { status: 500 }
    );
  }
}
