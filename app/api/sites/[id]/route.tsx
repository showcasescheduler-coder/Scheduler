// app/api/sites/[id]/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Site from "@/models/Site";
import Screen from "@/models/Screen";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const siteId = params.id;

    // Validate ObjectId format
    if (!siteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: "Invalid site ID format" },
        { status: 400 }
      );
    }

    // Get the site first
    const site = await Site.findById(siteId);

    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    // Get all screens for this site using the existing siteId relationship
    const screens = await Screen.find({ siteId: site._id }).sort({ name: 1 });

    // Combine site data with screens
    const siteWithScreens = {
      ...site.toObject(),
      screens: screens,
      screenCount: screens.length,
    };

    return NextResponse.json({
      success: true,
      site: siteWithScreens,
    });
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const siteId = params.id;
    
    // Validate ObjectId format
    if (!siteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: "Invalid site ID format" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Extract screens from body to handle separately
    const { screens: screenUpdates, ...siteData } = body;
    
    // Log for debugging
    console.log("Updating site with customPrompt:", siteData.customPrompt);

    // Update the site (without screens)
    const updatedSite = await Site.findByIdAndUpdate(siteId, siteData, {
      new: true,
    });

    if (!updatedSite) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }
    
    // Update screens if provided
    if (screenUpdates && Array.isArray(screenUpdates)) {
      for (const screen of screenUpdates) {
        if (screen._id) {
          await Screen.findByIdAndUpdate(
            screen._id,
            {
              name: screen.name,
              capacity: screen.capacity,
              features: screen.features || [],
              type: screen.type,
              status: screen.status
            },
            { new: true }
          );
        }
      }
    }

    // Get all screens for the updated site
    const screens = await Screen.find({ siteId: siteId }).sort({ name: 1 });

    const siteWithScreens = {
      ...updatedSite.toObject(),
      screens: screens,
      screenCount: screens.length,
    };

    return NextResponse.json({
      success: true,
      site: siteWithScreens,
    });
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update site" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const siteId = params.id;
    
    // Validate ObjectId format
    if (!siteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: "Invalid site ID format" },
        { status: 400 }
      );
    }

    // Find the site first
    const site = await Site.findById(siteId);
    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    // Delete all screens associated with this site using the siteId field
    await Screen.deleteMany({ siteId: siteId });

    // Delete the site
    await Site.findByIdAndDelete(siteId);

    return NextResponse.json({
      success: true,
      message: "Site and associated screens deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
