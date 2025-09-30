// app/api/sites/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Site from "@/models/Site";
import Screen from "@/models/Screen";

export async function GET() {
  try {
    await dbConnect();

    // Get all sites first
    const sites = await Site.find().sort({ name: 1 });

    // For each site, get screens using the existing siteId relationship
    const sitesWithScreens = await Promise.all(
      sites.map(async (site) => {
        try {
          // Get all screens for this site using the siteId field
          const screens = await Screen.find({ siteId: site._id }).sort({ name: 1 });

          return {
            ...site.toObject(),
            screens: screens,
            screenCount: screens.length,
          };
        } catch (error) {
          console.error(`Error fetching screens for site ${site._id}:`, error);
          return {
            ...site.toObject(),
            screens: [],
            screenCount: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      sites: sitesWithScreens,
    });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, description, address, status, customPrompt, amenities } =
      body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: "Name and address are required" },
        { status: 400 }
      );
    }

    const site = new Site({
      name,
      description,
      address,
      status: status || "active",
      customPrompt: customPrompt || "",
      amenities: amenities || [],
    });

    await site.save();

    // Return site with screenCount
    const siteWithCount = {
      ...site.toObject(),
      screenCount: 0, // New sites start with 0 screens
    };

    return NextResponse.json(
      {
        success: true,
        site: siteWithCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create site" },
      { status: 500 }
    );
  }
}
