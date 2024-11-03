import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const {
    previewSchedule,
    eventBlocks,
    routineBlocks,
    tasks,
    projects,
    userInput,
    startTime,
    endTime,
  } = await request.json();

  console.log(previewSchedule);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  const createSchedulePrompt = `You are an expert scheduling assistant helping to refine a client's daily schedule based on their feedback. You have their current proposed schedule and their requested changes. Your goal is to create an optimized revised schedule that incorporates their feedback while maintaining scheduling best practices.

CURRENT SCHEDULE:
${JSON.stringify(previewSchedule, null, 2)}

REQUESTED CHANGES:
User Request: "${userInput}"

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

SCHEDULE MODIFICATION PRINCIPLES:
1. Event Handling:
- Events are ABSOLUTELY IMMUTABLE unless the user EXPLICITLY requests a change
- Example of explicit change request: "move my 2pm meeting to 3pm" or "remove the doctor's appointment"
- If user's request conflicts with an event and doesn't explicitly mention modifying it, keep the event and explain the conflict
- All other scheduling must work around unchangeable events

2. Change Implementation Priority:
a) Explicitly requested changes (excluding events unless specifically mentioned)
b) Moving flexible tasks to accommodate requested changes
c) Schedule rebalancing to maintain flow
d) Optional improvements where possible

3. Schedule Stability:
- Keep all events in their original times unless explicitly told to change them
- Maintain existing task groupings unless changes are requested
- Minimize unnecessary changes to parts of the schedule that weren't mentioned
- Preserve successful elements of the original schedule

4. Change Analysis:
- First identify if any events are mentioned in the user's request
- Carefully parse user feedback for explicit vs implicit change requests
- For event-related conflicts, explain why changes couldn't be made
- Apply changes in a way that preserves schedule cohesion

REGENERATION INSTRUCTIONS:
1. First, check if user explicitly requests any event modifications
2. Keep all events fixed UNLESS specifically mentioned in user request
3. Modify non-event blocks/tasks according to feedback
4. If requested changes conflict with immutable events, explain in rationale
5. Rebalance surrounding schedule elements as needed
6. Detail all changes and reasoning in scheduleRationale

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Detailed explanation of: 1) Whether any events were modified and why 2) What other changes were made and why 3) How user feedback was incorporated 4) Any conflicts with immutable events 5) What parts of the original schedule were preserved 6) Any requested changes that couldn't be implemented and why",
  "blocks": [
    {
      "name": "Block name (specific if context given, generic if not)",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": string or null,
      "routineId": string or null,
      "tasks": [
        {
          "id": string,
          "name": string,
          "description": string,
          "duration": "High" | "Medium" | "Low",
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
