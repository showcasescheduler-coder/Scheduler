import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { project, today } = await request.json();

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing OpenAI API key" },
      { status: 500 }
    );
  }

  const prompt = `
Generate a list of tasks to complete the following project:

Project Name: ${project.name}
Project Description: ${project.description}
Project Deadline: ${project.deadline}
Today's Date: ${today}

Requirements:
1. Each task should take no more than 3 hours to complete.
2. Tasks should be specific, actionable, and technically accurate.
3. Include a mix of different priority levels (Low, Medium, High).
4. Provide a short description for each task.
5. Estimate a duration for each task (in minutes).
6. Assign a realistic deadline to each task, considering task dependencies and the overall project timeline.
7. Ensure tasks cover all aspects necessary for project completion.
8. Use up-to-date technical knowledge to create relevant and useful tasks.

Respond with a JSON array of task objects in this format:
[
  {
    "name": "Task name",
    "description": "Short task description",
    "priority": "Low" | "Medium" | "High",
    "duration": number (in minutes),
    "deadline": "YYYY-MM-DD",
    "status": "Todo",
    "completed": false
  },
  ...
]
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful project management assistant with extensive technical knowledge.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tasks");
    }

    const data = await response.json();
    const tasksData = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(tasksData);
  } catch (error) {
    console.error("Error generating tasks:", error);
    return NextResponse.json(
      { message: "Error generating tasks" },
      { status: 500 }
    );
  }
}
