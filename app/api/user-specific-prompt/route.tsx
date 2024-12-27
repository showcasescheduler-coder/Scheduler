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

  const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. They have a full backlog of tasks, events, and routines, but haven't given specific instructions about exact timing for everything. Your goal is to create an optimized schedule while identifying any specific tasks they reference.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

SCHEDULING PRINCIPLES:
1. Event and Routine Priority:
- Events are immutable and must be scheduled at their specified times
- Recurring routines should be placed according to their preferred times
- Never reschedule or modify events
- Events take absolute priority over all other activities

2. Break and Energy Management:
- Include 15-minute breaks between cognitive tasks
- Schedule a 45-minute lunch break between 12:00-13:00 if possible
- Consider natural energy peaks (morning) for high-priority tasks
- Avoid scheduling intense tasks right after lunch
- Maximum continuous work period should be 90 minutes

3. Task Distribution and Flow:
- Analyze user input for mentions of existing tasks, projects, or activities
- Group similar tasks together to maintain focus and reduce context switching
- Consider task relationships and dependencies
- Distribute high-priority tasks across the day, not all in one block
- Allow buffer time between different types of work

4. Gap Management:
- For gaps 45+ minutes: Add a break followed by a focused work block
- For gaps 30-45 minutes: Add a single focused work block
- Focused work blocks should suggest activities based on:
  a) Any available tasks from backlog
  b) Related work to surrounding blocks
  c) General focus suggestions if no specific tasks available

5. Block Structure:
- Morning blocks (before lunch): Prioritize high-cognitive tasks
- Early afternoon: Collaborative/lighter tasks
- Late afternoon: Mixed priority tasks, routines
- Include regular breaks for optimal productivity
- Keep blocks balanced (typically 60-90 minutes)

SCHEDULING INSTRUCTIONS:
1. Lock in all events at their exact times (isEvent: true, include eventId)
2. Place routine blocks (isRoutine: true, include routineId)
3. Add lunch break if schedule spans midday
4. Identify and place specifically referenced tasks with appropriate breaks
5. Fill significant gaps with focused work blocks and breaks
6. Ensure no block exceeds 90 minutes without a break
7. Include detailed explanation in scheduleRationale

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Detailed explanation including: 1) Referenced task placement 2) Break strategy 3) Gap management approach 4) Energy flow considerations 5) Unscheduled task handling",
  "blocks": [
    {
      "name": "Block name (descriptive and specific)",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": string or null,
      "routineId": string or null,
      "tasks": [
        {
          "id": "existing-id-if-found or null",
          "name": "Task name",
          "description": "Activity details and context",
          "duration": number,
          "priority": "High" | "Medium" | "Low",
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
