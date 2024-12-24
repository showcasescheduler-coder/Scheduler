import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface ProjectInput {
  name: string;
  description: string;
  deadline: string;
}

// Define allowed duration values in minutes
const ALLOWED_DURATIONS = [5, 10, 15, 30, 60, 90, 120];

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

  const systemPrompt = `You are part of a personal scheduling app that helps users complete short-term projects (2 weeks or less) by breaking them down into simple, achievable tasks. Your role is to create practical task lists that make projects feel manageable and help users maintain momentum.

Key Principles:
- Create clear, action-oriented tasks that feel achievable
- Avoid unnecessary planning/documentation tasks unless specifically requested
- Focus on actual work that moves the project forward
- Keep tasks simple and straightforward
- Minimize dependencies between tasks where possible

Task Duration Rules:
- Tasks MUST use these exact durations (in minutes): ${ALLOWED_DURATIONS.join(
    ", "
  )}
- Choose realistic durations that don't overwhelm users
- Prefer shorter tasks (15-60 mins) to maintain momentum
- Only use longer durations (90-120 mins) for complex work that can't be split

You MUST respond with a valid JSON array of tasks. Each task MUST follow this schema:
{
  "name": "Clear, action-oriented task name",
  "description": "Simple description of what needs to be done",
  "priority": "Low" | "Medium" | "High",
  "duration": ${ALLOWED_DURATIONS.join(" | ")},
  "deadline": "YYYY-MM-DD",
  "status": "Todo",
  "completed": false,
  "dependencies": string[]
}

Guidelines:
1. Write tasks in plain, straightforward language
2. Focus on concrete actions ("Write login function" vs "Implement authentication")
3. Keep descriptions brief but clear
4. Only add dependencies when strictly necessary
5. Prioritize based on project flow and deadlines`;

  const userPrompt = `
PROJECT INFORMATION:
Name: ${project.name}
Description: ${project.description}
Deadline: ${project.deadline}
Today's Date: ${today}

USER CONTEXT:
${context ? context : "No additional context provided"}

Break this project down into practical tasks that will help the user complete their project successfully:

1. Task Creation:
   - Create simple, clear tasks that directly contribute to the project goal
   - Each task MUST be exactly one of these durations (in minutes): ${ALLOWED_DURATIONS.join(
     ", "
   )}
   - Focus on actual work rather than process or documentation
   - Make tasks feel achievable and satisfying to complete

2. Task Organization:
   - List tasks in a logical order of completion
   - Only include essential dependencies
   - Spread work evenly across the project timeline
   - Consider user energy levels when setting task durations

3. Task Writing:
   - Use clear, everyday language
   - Write descriptions that make the next action obvious
   - Include just enough detail to know when it's done
   - Keep everything simple and practical

Remember to:
- Use ONLY the specified duration values
- Keep tasks focused on real work
- Minimize planning/documentation overhead
- Make the project feel achievable

Respond ONLY with a valid JSON array of tasks following the schema.`;

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
