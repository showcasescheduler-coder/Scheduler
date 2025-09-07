// app/api/amenities/[id]/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Amenity from "@/models/Amenity";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();

    const amenity = await Amenity.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!amenity) {
      return NextResponse.json(
        { success: false, error: "Amenity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, amenity });
  } catch (error) {
    console.error("Error updating amenity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update amenity" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const amenity = await Amenity.findByIdAndDelete(params.id);

    if (!amenity) {
      return NextResponse.json(
        { success: false, error: "Amenity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Amenity deleted",
    });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete amenity" },
      { status: 500 }
    );
  }
}
