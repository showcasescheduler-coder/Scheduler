// app/api/screens/[id]/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Screen from "@/models/Screen";
import Site from "@/models/Site";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const screenId = params.id;
    const body = await request.json();

    const updatedScreen = await Screen.findByIdAndUpdate(screenId, body, {
      new: true,
    });

    if (!updatedScreen) {
      return NextResponse.json(
        { success: false, error: "Screen not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, screen: updatedScreen });
  } catch (error) {
    console.error("Error updating screen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update screen" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const screenId = params.id;

    // Find the screen first to get its siteId
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return NextResponse.json(
        { success: false, error: "Screen not found" },
        { status: 404 }
      );
    }

    // Remove screen from site's screens array
    await Site.findByIdAndUpdate(
      screen.siteId,
      { $pull: { screens: screenId } },
      { new: true }
    );

    // Delete the screen
    await Screen.findByIdAndDelete(screenId);

    return NextResponse.json({
      success: true,
      message: "Screen deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting screen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete screen" },
      { status: 500 }
    );
  }
}
