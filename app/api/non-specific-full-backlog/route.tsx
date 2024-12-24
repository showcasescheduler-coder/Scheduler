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

  console.log("this is running");
  console.log("these are the routines", routineBlocks);

  const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following a strict priority system while respecting all time constraints.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

SCHEDULING PROCESS:
Follow this exact order when building the schedule:

1. Initial Setup Phase:
- Validate all time windows and durations
- Ensure all tasks have required fields
- Calculate total available time

2. Fixed Time Blocks (Highest Priority):
- Place all events at their exact specified times
- Events cannot be moved or modified
- Mark these times as unavailable

3. Deadline-Critical Tasks:
- Place tasks with deadlines within 24-48 hours
- Must schedule within task's specified time window
- Add to unscheduled list if cannot fit within window
- Note deadline conflicts in schedule rationale

4. User-Specified Items:
- Parse user's explicit scheduling requests
- Place mentioned tasks/projects/routines
- Must respect each item's time window
- Flag any unfulfilled requests for explanation

5. Routine Integration:
- Place routines within their specified time windows
- Keep exact routine names and IDs
- Never modify routine tasks or create new ones
- Block duration must match sum of routine tasks
- Add to unscheduled list if cannot fit in window

6. Remaining Task Integration:
- Process other tasks based on:
  * Priority level
  * Task relationships (same project/type)
  * Time window constraints
  * Energy patterns (complex tasks in morning)
- Group related tasks when possible
- Never create tasks that don't exist in input data

7. Break Planning:
- Maximum 2.5 hours of deep work without breaks
- Minimum 15-minute breaks between work sessions
- Use routine breaks where available
- Add additional breaks where needed

8. Gap Analysis:
- Identify gaps longer than 30 minutes
- For longer gaps, create "Free Time" blocks
- Never invent new tasks to fill gaps

VALIDATION RULES:
1. Blocks must never overlap
2. Each block's duration must exactly match the sum of its tasks
3. Every task must be scheduled within its specified time window
4. Routines must maintain their exact structure and timing windows
5. Never create tasks that don't exist in the input data
6. Always include breaks between deep work sessions

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Detailed explanation including:
    - How deadline-critical tasks were handled
    - Which user-specified items were scheduled
    - How routines were placed
    - Break placement strategy
    - Any scheduling conflicts or unscheduled items
    - Why certain tasks couldn't be scheduled",
  "blocks": [
    {
      "name": "Block name",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": string or null,
      "routineId": "MUST use exact _id from input routine when isRoutine is true"
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

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. They have a full backlog of tasks, events, and routines, but haven't given specific instructions about exact timing for everything. Your goal is to create an optimized schedule while identifying any specific tasks they reference.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // SCHEDULING PRINCIPLES:
  // 1. Event and Routine Priority:
  // - Events are immutable and must be scheduled at their specified times
  // - Recurring routines should be placed according to their preferred times
  // - Never reschedule or modify events
  // - Events take absolute priority over all other activities

  // 2. Task Reference Detection:
  // - Analyze user input for mentions of existing tasks, projects, or activities
  // - Look for:
  //   * Direct task names or close matches
  //   * Project references
  //   * Routine mentions
  //   * Task descriptions or keywords
  // - When found, use the existing task's ID and details
  // - For ambiguous references, prefer exact matches over partial matches

  // 3. Schedule Building Priority Order:
  // a) Fixed events (unchangeable, must be included)
  // b) Routine blocks (following their usual schedule)
  // c) Specifically referenced tasks from user input
  // d) High priority tasks
  // e) Tasks with approaching deadlines
  // f) Related tasks to minimize context switching
  // g) Lower priority tasks to fill remaining time

  // 4. Energy and Flow Optimization:
  // - Place high-cognitive tasks during peak energy (typically morning)
  // - Group similar tasks to maintain focus and reduce context switching
  // - Schedule breaks between different types of work
  // - Consider task relationships and dependencies
  // - Avoid cognitive overload with proper task spacing

  // 5. Schedule Balance:
  // - Maintain appropriate work/break ratios
  // - Include buffer time between major tasks
  // - Account for natural energy patterns
  // - Ensure sustainable pacing throughout the day

  // SCHEDULING INSTRUCTIONS:
  // 1. First, lock in all events at their exact times
  // 2. Place routine blocks according to their usual schedule
  // 3. Identify and extract any task references from user input
  // 4. Build remaining schedule prioritizing:
  //    - Referenced tasks
  //    - Task priority
  //    - Deadlines
  //    - Dependencies
  //    - Energy optimization
  // 5. Include rationale for task placement
  // 6. Note any tasks that couldn't be scheduled
  // 7. Blocks times cannot overlap
  // 8. Block duration must be equal to total duration of tasks inside.

  // Return ONLY a JSON object with this structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Detailed explanation of schedule structure, including:
  //     - How events and routines were prioritized
  //     - Which tasks were referenced in user input
  //     - Why tasks were placed in their slots
  //     - Energy and flow considerations
  //     - Any tasks that couldn't be scheduled",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": string or null,
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //           "aiInsight": "How this task fits into the overall schedule flow"
  //         }
  //       ]
  //     }
  //   ],
  //   "unscheduledTasks": [
  //     {
  //       "id": string,
  //       "name": string,
  //       "reason": "Why this task couldn't be scheduled"
  //     }
  //   ]
  // }`;

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
