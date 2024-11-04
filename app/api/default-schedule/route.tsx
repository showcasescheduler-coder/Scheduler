import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const {
    eventBlocks,
    routineBlocks,
    tasks,
    projects,
    userInput,
    startTime,
    endTime,
  } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  const createSchedulePrompt = `You are an expert scheduling assistant helping a client who hasn't provided many specific details about their day. They either haven't specified exactly how they want their day structured and/or don't have enough tasks to fill their schedule completely.

  Your goal is to:
  1. First, incorporate any specific events, routines, or tasks they have provided
  2. Then, fill the remaining time with helpful suggested time blocks based on behavioral science and productivity best practices
  3. Create a schedule that can serve as a template for them to add more specific tasks later

  AVAILABLE DATA:
  Time Frame: ${startTime} to ${endTime}
  User Request: "${userInput}"

  Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  Events: ${JSON.stringify(eventBlocks, null, 2)}
  Routines: ${JSON.stringify(routineBlocks, null, 2)}
  Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  SCHEDULING PRINCIPLES:
  1. Cognitive Load Management:
  - Place complex/creative tasks during peak energy periods (typically morning)
  - Group similar tasks together to minimize context switching
  - Schedule administrative/routine tasks during natural energy dips
  - Maintain flow by grouping similar activities together

  2. Productivity Optimization:
  - Create focused work blocks of 60-90 minutes
  - Include strategic breaks (15-30 mins) between major blocks
  - Add buffer time for transitions and unexpected issues
  - Limit back-to-back meetings/high-focus activities
  - Ensure adequate breaks for renewal and maintaining energy

  3. Block Creation Strategy:
  - First Priority: Place all existing events, routines, and tasks
  - Second Priority: Create blocks based on any preferences mentioned in user's request
  - Third Priority: Fill remaining time with science-backed productivity blocks
  - Use specific names if user provided context (e.g., "Project X Deep Work")
  - Use descriptive generic names if no context (e.g., "Morning Focus Block")
  - Leave flexibility within blocks for user to add specific tasks later

  4. Time Block Suggestions:
  - Morning Review/Planning Block (15-30 mins if schedule starts in morning)
  - Deep Work Blocks (60-90 mins, placed during peak energy)
  - Administrative/Email Blocks (30-45 mins, during lower energy periods)
  - Break and Buffer Times (15-30 mins between major blocks)
  - Wrap-Up Block (15-30 mins if schedule ends in evening)

  SCHEDULING INSTRUCTIONS:
  1. Review all fixed commitments (events, routines, tasks) and place these first
  2. Identify any scheduling preferences from the user's request
  3. Fill remaining time with suggested blocks following behavioral science principles
  4. Ensure smooth transitions and adequate breaks
  5. Create a schedule that feels supportive rather than overwhelming
  6. Make block names clear and actionable for future task addition

  Return ONLY a JSON object with this structure:
  {
    "currentTime": "${new Date().toTimeString().slice(0, 5)}",
    "scheduleRationale": "Detailed explanation of the schedule's structure and logic, including how it optimizes for productivity and energy levels, how it incorporates any user preferences, and how it allows for future task additions",
    "userStartTime": "${startTime}",
    "userEndTime": "${endTime}",
    "blocks": [
      {
        "name": "Block name (specific if context given, generic if not)",
        "startTime": "HH:MM format",
        "endTime": "HH:MM format",
        "description": "A clear explanation of why this block is placed here and how it serves the user's productivity. Include energy level considerations, task grouping logic, and how it fits into the overall flow of the day.",
        "isEvent": boolean,
        "isRoutine": boolean,
        "isStandaloneBlock": boolean,
        "eventId": string or null,
        "routineId": string or null,
        "tasks": [
          {
            "id": existing-id-if-found or null,
            "name": string,
            "description": string,
            "duration": number,
            "priority": string,
            "isRoutineTask": boolean
          }
        ]
      }
    ]
  }`;

  try {
    const schedule = await getAnthropicResponse(apiKey, createSchedulePrompt);

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Error creating schedule" },
      { status: 500 }
    );
  }
}

async function getAnthropicResponse(apiKey: string, prompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Anthropic API error: ${response.status}`, errorText);
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
    console.error("Received content:", content);
    throw new Error("Invalid JSON response from Anthropic API");
  }
}
