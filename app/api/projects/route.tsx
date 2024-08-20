import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Project, { IProject } from "@/models/Project";
import "@/models/Task"; // Add this line

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

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

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .populate("tasks") // This line populates the tasks
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
