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

  const createSchedulePrompt = `You are an expert scheduling assistant helping a client who has both a full backlog and specific instructions for their day. Your goal is to create a schedule that properly balances events, routines, and specific requests while intelligently incorporating backlog tasks.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

SCHEDULING PRINCIPLES:

1. Priority Hierarchy:
   a) Fixed events (cannot be moved)
   b) Routine handling (see detailed rules below)
   c) User's specific task requests
   d) High-priority backlog tasks
   e) Deadline-driven project tasks
   f) Other backlog tasks

2. Routine Handling Rules:
   - After placing events, analyze routines for this day's schedule
   - Check user input for:
     * Explicitly requested routines (keep as specified)
     * Modified routine timings (honor new times)
     * Routine cancellations (skip these routines)
     * Unmentioned routines (add within their allowed windows)
   - For each routine:
     * Verify if already included in user's specific requests
     * If not mentioned and not conflicting, place in preferred time window
     * If conflicting with events, try alternate times within allowed window
     * Skip routine only if explicitly cancelled or no valid time slot exists

3. Break and Energy Management:
   [Previous break management rules remain the same]

4. Backlog Integration:
   [Previous backlog integration rules remain the same]

5. Cognitive Load Distribution:
   [Previous cognitive load rules remain the same]

SCHEDULE BUILDING PROCESS:

1. Event and Routine Framework:
   - Place all fixed events
   - Process routines according to Routine Handling Rules
   - Document any routine conflicts or adjustments
   
2. User Request Integration:
   - Add specifically requested tasks
   - Skip duplicate routines already handled
   - Resolve any conflicts with placed routines

3. Backlog Integration:
   [Previous backlog integration steps remain the same]

4. Break Optimization:
   [Previous break optimization steps remain the same]

5. Final Review:
   [Previous review steps plus:]
   - Verify routine placement and conflicts
   - Confirm cancelled routines were skipped
   - Check routine timing windows were respected

Return ONLY a JSON object with this structure:
{
  "scheduleRationale": "Brief explanation of key decisions and conflicts",
  "blocks": [
    {
      "name": "Block name (descriptive of activity)",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": "existing-id-if-found or null",
      "routineId": "existing-id-if-found or null",
      "tasks": [
        {
          "id": "existing-id-if-found or null",
          "name": string,
          "description": string,
          "duration": number,
          "priority": "High" | "Medium" | "Low",
          "isRoutineTask": boolean,
          "projectId": string or null,
          "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
          "isUserSpecified": boolean, 
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
      max_tokens: 4096, // Increased from 1024 to 4096
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
