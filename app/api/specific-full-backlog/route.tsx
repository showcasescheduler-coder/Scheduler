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

  const createSchedulePrompt = `You are an expert scheduling assistant helping a client who has both a full backlog and specific instructions for their day. Your goal is to create a schedule that prioritizes events, honors their specific requests, incorporates routines, and intelligently handles any remaining time.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

ANALYSIS STEPS:
1. Priority Order Analysis:
a) First: Identify all events (these cannot be moved)
b) Second: Extract user's specific instructions for tasks and timing
c) Third: Check for existing routines that fit around a & b
d) Fourth: Determine if user wants remaining time filled
   - Look for phrases like "organize my whole day" or "fill the rest"
   - Note any intensity preferences ("productive", "relaxed", etc.)

2. Conflict Detection:
- Check if user's requested times conflict with events
- Identify overlaps between specific requests and routines
- Note any timing conflicts in scheduleRationale
- Suggest alternative times for conflicting requests

3. Schedule Building:
FIRST PRIORITY - Events:
- Place all events in their exact time slots
- These are immutable and must be respected
- Mark with isEvent: true and include eventId

SECOND PRIORITY - User's Specific Instructions:
- Schedule all specifically requested activities
- If conflict with event, explain in rationale
- Look for matches with existing tasks in backlog
- Use existing task IDs when found

THIRD PRIORITY - Routines:
- Include user's regular routines where they fit
- Mark with isRoutine: true and include routineId
- Skip routines that conflict with higher priorities

FOURTH PRIORITY - Remaining Time:
IF user requested full day organization:
- Fill gaps with optimized task selection
- Use behavioral psychology principles
- Match task intensity to energy levels
- Group similar tasks together

IF user didn't request full day:
- Add suggestive blocks
- Provide recommendations
- Keep blocks flexible
- Include productivity tips

4. Schedule Optimization:
- Look for natural task groupings
- Suggest minor timing adjustments for better flow
- Add appropriate buffer times
- Maintain energy level awareness

SCHEDULE GENERATION INSTRUCTIONS:
1. Follow priority order strictly (Events > Specific Instructions > Routines > Optional Filling)
2. For each block:
   - Use existing task IDs when matching backlog items
   - Generate unique IDs for new tasks
   - Include clear descriptions with context
   - Note any conflicts or adjustments made

Return ONLY a JSON object with this structure:
{
  "scheduleRationale": "Detailed explanation covering:
    - How events were prioritized
    - How specific instructions were incorporated
    - Any conflicts and resolutions
    - Which routines were included/excluded and why
    - Why remaining time was filled or left as suggestions
    - Energy flow considerations
    - Any tasks that couldn't be scheduled due to conflicts",
  "blocks": [
    {
      "name": "Block name (specific or suggestive)",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": string or null,
      "routineId": string or null,
      "tasks": [
        {
          "id": "existing-id-if-found or null,
          "name": "Task name",
          "description": "Context including conflict resolution if any, setup needs, and whether this was specifically requested",
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
