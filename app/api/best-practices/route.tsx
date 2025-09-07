// app/api/best-practices/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongo";
import Section from "@/models/Section";
import SectionItem from "@/models/SectionItem";

export async function GET() {
  try {
    await dbConnect();

    const sections = await Section.find();
    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        const items = await SectionItem.find({ sectionId: section._id });
        return {
          ...section.toObject(),
          items,
        };
      })
    );

    return NextResponse.json({ success: true, sections: sectionsWithItems });
  } catch (error) {
    console.error("Error fetching best practices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch best practices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, items } = body;

    if (!title || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Title and items array are required" },
        { status: 400 }
      );
    }

    // Create the section
    const section = new Section({
      name: title,
    });
    await section.save();

    // Create the items for this section
    const createdItems = await Promise.all(
      items.map(async (item) => {
        const sectionItem = new SectionItem({
          sectionId: section._id,
          name: item.title,
          description: item.description,
        });
        await sectionItem.save();
        return sectionItem;
      })
    );

    return NextResponse.json(
      {
        success: true,
        section: {
          ...section.toObject(),
          items: createdItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating best practice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create best practice" },
      { status: 500 }
    );
  }
}
