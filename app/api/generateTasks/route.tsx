import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface ProjectInput {
  name: string;
  description: string;
  deadline: string;
}

interface Task {
  name: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  duration: number;
  deadline: string;
  status: "Todo";
  completed: false;
  dependencies: string[];
}

export async function POST(request: NextRequest) {
  const { project, today, context } = await request.json();

  if (
    !project ||
    !project.name ||
    !project.description ||
    !project.deadline ||
    !today
  ) {
    return NextResponse.json(
      { message: "Invalid project data" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  const systemPrompt = `You are an expert technical project manager specializing in breaking down projects into well-defined tasks. You excel at analyzing project requirements and additional context to create comprehensive, practical task lists. Your task breakdowns should integrate both the core project requirements and any specific needs or preferences expressed in the user's context.

You MUST respond with a valid JSON array of tasks. Each task in the array MUST follow this exact schema:
{
  "name": "Task name",
  "description": "Detailed description including acceptance criteria",
  "priority": "Low" | "Medium" | "High",
  "duration": number (in minutes),
  "deadline": "YYYY-MM-DD",
  "status": "Todo",
  "completed": false,
  "dependencies": string[],
  "type": "deep-work" | "planning" | "break" | "admin" | "collaboration"
}`;

  const userPrompt = `
PROJECT INFORMATION:
Name: ${project.name}
Description: ${project.description}
Deadline: ${project.deadline}
Today's Date: ${today}

USER CONTEXT:
${context ? context : "No additional context provided"}

Please analyze this project and create a detailed task breakdown following these requirements:

1. Context Analysis:
   - Carefully analyze the provided user context to understand specific requirements and constraints
   - Identify any special considerations or focus areas mentioned in the context
   - Consider any technical requirements or preferences indicated
   - Look for implicit requirements or constraints in the context

2. Task Requirements:
   - Break down the project into tasks that take 2-3 hours maximum
   - Tasks must be specific, actionable, and technically accurate
   - Ensure tasks align with both the project description and the additional context
   - Include necessary setup, development, testing, and documentation tasks
   - Add tasks specifically addressing requirements mentioned in the context

3. Task Planning:
   - Prioritize tasks based on dependencies and critical path
   - Set realistic deadlines within the project timeline
   - Consider any timing constraints or preferences mentioned in the context
   - Ensure logical task sequencing

4. Comprehensive Coverage:
   - Ensure all aspects of the project are addressed
   - Include necessary infrastructure and setup tasks
   - Add quality assurance and testing tasks
   - Include documentation and handover tasks
   - Add tasks for any specific requirements mentioned in the context

5. Task Details:
   - Write clear, specific task descriptions
   - Include acceptance criteria in descriptions
   - Specify any technical requirements mentioned in the context
   - Note any dependencies or prerequisites

Remember to respond ONLY with a valid JSON array of tasks following the specified schema.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tasks");
    }

    const data = await response.json();
    let tasksData: Task[];

    try {
      // Try to parse the response content directly
      tasksData = JSON.parse(data.content[0].text);
    } catch (parseError) {
      // If direct parsing fails, attempt to extract JSON from the response
      const jsonMatch = data.content[0].text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasksData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }

    // Validate the response structure
    if (!Array.isArray(tasksData)) {
      throw new Error("Response is not an array of tasks");
    }

    // Ensure each task matches the required structure
    tasksData = tasksData.map((task) => ({
      name: task.name,
      description: task.description,
      priority: task.priority,
      duration: task.duration,
      deadline: task.deadline,
      status: "Todo",
      completed: false,
      dependencies: task.dependencies || [],
    }));

    return NextResponse.json(tasksData);
  } catch (error) {
    console.error("Error generating tasks:", error);
    return NextResponse.json(
      { message: "Error generating tasks" },
      { status: 500 }
    );
  }
}
