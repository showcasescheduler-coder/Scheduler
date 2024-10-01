import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Project, { IProject } from "@/models/Project";
import "@/models/Task"; // Add this line

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Ensure userId is included in the body
    if (!body.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const newProject: IProject = new Project(body);
    await newProject.save();

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 })
      .populate("tasks")
      .exec();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
