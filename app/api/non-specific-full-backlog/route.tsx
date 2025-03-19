// /app/api/generate-schedule/route.ts
import { NextRequest } from "next/server";

export const maxDuration = 60;

const outputJsonFormat = `
Return ONLY a JSON object with this structure:
{
  "scheduleRationale": "Response to user explaining how their request was handled, any conflicts, suggestions, and clarifications. You are speaking directly to the customer, so please speak with good customer service",
  "blocks": [
    {
      "name": "Clear context-appropriate name",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "blockDuration": number,
      "tasksDuration": number,
      "type": "deep-work" | "break" | "meeting" | "health" | "exercise" | "admin" | "personal",
      "routineId": "exact _id from routines or null",
      "eventId": "exact _id from events or null",
      "tasks": // If eventId is not null, this MUST be an empty array ([])
               // If eventId is null, include task objects:
               [
                 {
                   "id": "existing-id-if-found or null",
                   "name": "Task name",
                   "duration": number,
                   "projectId": "exact _id from projects or null",
                   "routineId": "exact _id from routines or null"
                 }
               ]
    }
  ]
}`;

// Define the output JSON structure once.
// const outputJsonFormat = `
// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining how their request was handled, any conflicts, suggestions, and clarifications. You are speaking directly to the customer, so please speak with good customer service",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
//       "blockDuration": number,
//       "tasksDuration": number,
//       "type": "deep-work" | "break" | "meeting" | "health" | "exercise" | "admin" | "personal",
//       "routineId": "exact _id from routines or null",
//       "tasks": [
//         {
//           "id": "existing-id-if-found or null",
//           "name": "Task name",
//           "duration": number,
//           "projectId": "exact _id from projects or null",
//           "routineId": "exact _id from routines or null",
//           "eventId": "exact _id from events or null"
//         }
//       ]
//     }
//   ]
// }`;

// Main endpoint
export async function POST(request: NextRequest) {
  // The client should send a "type" field along with all the common data.
  // For example, type can be "default", "update", or omitted for the base prompt.
  const {
    type, // "default", "update", or undefined (base prompt)
    currentSchedule,
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
    return new Response(
      JSON.stringify({ message: "Missing Anthropic API key" }),
      { status: 500 }
    );
  }

  console.log("the type is ", type);

  let createSchedulePrompt = "";

  // Choose the proper prompt text based on the "type" field.
  switch (type) {
    case "default":
      console.log("default ran");
      createSchedulePrompt = `You are an expert scheduling assistant helping create a schedule for a user who may have minimal saved data. Your primary goal is to honor the user's specific requests while thoughtfully enhancing their schedule with evidence-based productivity principles where appropriate.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"
Events (Must be honored): ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}
Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}

REQUEST ANALYSIS:
1. First, determine if the user has provided specific scheduling guidance or a vague request:
   - Specific requests include clear time blocks, activities, or schedule requirements
   - Vague requests provide minimal guidance (e.g., "Create a study schedule")
2. For specific requests, honor ALL user-specified elements exactly as requested
3. For vague requests, apply a suitable template based on detected keywords

SCHEDULE CREATION PRIORITIES:
1. User Intent & Fixed Commitments (HIGHEST PRIORITY):
   - Honor all specific time blocks, activities, and preferences mentioned by the user
   - Place all events at their exact times; these cannot be moved
   - Use only the provided routine IDs from the routines array; if a routine does not exist, set routineId to null
   - Prioritize any tasks with urgent deadlines (e.g., due in the next 48 hours)
   - Event blocks should not contain any tasks
   - Respect the nature and purpose of the user's day (e.g., work day vs. family day vs. rest day)
   - When creating blocks from routines, use the routine's blockType property as the block's type.
   - When creating blocks from events, use the event's eventType property as the block's type.


2. Schedule Enhancement with Behavioral Science:
   - ONLY after honoring user requests, enhance the schedule with appropriate principles:
   
   a) Energy-Aligned Scheduling
      • For productivity-focused days: Place cognitively demanding tasks earlier in the day
      • For physical activity days: Position workouts based on the user's typical energy patterns
      • Gradually decrease intensity as the day progresses
   
   b) Deep Work Optimization (for work/study schedules only)
      • Add 90-minute deep work blocks when aligned with user's goals
      • Limit to 2-3 deep work sessions per day
      • Include specific, outcome-focused tasks within deep work blocks
   
   c) Strategic Breaks
      • Insert 10-15 minute breaks after focused work periods
      • Include a proper lunch break (30-45 minutes) if schedule spans midday
      • Ensure breaks involve true context switching
      • Avoid scheduling consecutive break blocks - ensure there's productive activity between breaks
   
   d) Day Structure (apply only if compatible with user's schedule)
      • If the day starts early: Add a 15-30 minute morning planning block
      • If the day ends with work: Add a 15-minute closure/reflection block
      • Add 5-minute transition buffers between significantly different activities

3. Template Guidance (ONLY for vague requests):
   When user provides minimal guidance, select an appropriate template:
   
   • Study Template: Planning block (30 min), Deep Focus blocks (90 min), Active Learning blocks (60 min)
     Example tasks: "Review upcoming deadlines", "Deep focus on [subject]", "Practice active recall for [topic]"
   
   • Work Template: Planning block (30 min), Deep Work blocks (90 min), Admin block (30 min)
     Example tasks: "Plan today's priorities", "Focused work on [project]", "Process emails and admin tasks"
   
   • Exercise Template: Warmup (15 min), Main Activity (30-45 min), Cooldown (15 min)
     Example tasks: "Dynamic stretching warmup", "Complete [workout] session", "Static stretching cooldown"
   
   • Family/Personal Template: Preparation (30 min), Main Activities (60-120 min), Wind Down (30 min)
     Example tasks: "Prepare for [activity]", "Quality time with [family/friends]", "Reflect on the day"

4. Schedule Integrity:
   - Ensure no overlapping blocks
   - Round start/end times to 5-minute intervals
   - Block durations should exactly match the sum of their tasks' durations
   - For any blocks not explicitly requested by the user, add helpful placeholder tasks

5. ID Management:
   - Use exact IDs from the input for events, routines, and projects
   - For any new or placeholder items, set the corresponding IDs to null
   - Validate all routineIds against the provided routineBlocks array

RESPONSE FORMAT:
In the "scheduleRationale" field, briefly explain:
1. How you interpreted and honored the user's specific requests
2. What behavioral science principles you applied to enhance their schedule (if any)
3. Any relevant tips for maximizing the effectiveness of the schedule

${outputJsonFormat}`;
      break;

    case "update":
      console.log("Update ran");
      createSchedulePrompt = `You are an expert scheduling assistant helping to modify an existing schedule based on user requests. Your goal is to make targeted changes while preserving as much of the original schedule structure as possible.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
Current Schedule: ${JSON.stringify(currentSchedule, null, 2)}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

MODIFICATION RULES:
1. Change Minimization:
   - Only modify blocks/tasks specifically mentioned in the user request.
   - Preserve all other blocks and their timing exactly as is.
   - Maintain original block and task IDs whenever possible.
   - Keep existing breaks and buffers unless directly affected.
2. User Request Analysis:
   - Identify specific modifications requested (e.g. time changes, duration adjustments, additions, removals).
   - Only apply changes explicitly mentioned, leaving all other schedule elements intact.
3. Schedule Integrity:
   - Ensure no overlapping blocks.
   - Round times to 30-minute intervals.
   - Block duration must equal the sum of task durations.
   - No gaps longer than 2 hours.
   - Include breaks after 2.5 hours of work.
   - When creating blocks from routines, use the routine's blockType property as the block's type.
   - When creating blocks from events, use the event's eventType property as the block's type.
4. ID Management:
   - Use exact IDs from input data.
   - Set IDs to null for new items.
   - Correctly match tasks to their project, routine, or event.

${outputJsonFormat}`;
      break;

    // The base prompt (if type is omitted or not recognized) uses the original prompt.
    default:
      console.log("Full backlog ran");
      createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

CRITICAL RULES:
1. Time Integrity
   - No overlapping blocks.
   - Block duration MUST equal the sum of task durations.
     * Calculate blockDuration as (endTime - startTime) in minutes.
     * Calculate tasksDuration as the sum of all tasks' durations in that block.
     * **If the two values do not match, adjust task durations or block boundaries until they are identical.**
     * EXAMPLE: If a block runs from 10:00 to 11:30, then blockDuration = 90 minutes. Two tasks must sum exactly to 90 minutes (e.g., 50 and 40 minutes, not 60 and 60).
   - No gaps longer than 2 hours.
   - Include breaks after 2.5 hours of work.

2. User Intent Priority:
   - User-specified requests ALWAYS override any other scheduling principles.
   - Honor all specific time blocks, activities, and preferences mentioned by the user.
   - Place all events at their exact times; these cannot be moved.

3. Evidence-Based Scheduling Principles (apply ONLY when not conflicting with user requests):
   - Energy Management:
     * Place cognitively demanding tasks earlier in the day when possible.
     * Gradually decrease task intensity as the day progresses.
     * Limit deep work sessions to 2-3 per day at appropriate durations.
     * Unless explicitly requested otherwise, schedule cognitively demanding work before 7:00 PM.
     * Reserve evening hours (after 7:00 PM) for lighter activities (admin, personal, wind-down).
   
   - Strategic Breaks:
     * Insert short breaks after focused work periods.
     * Include appropriate meal breaks if schedule spans mealtimes.
     * Add transition buffers between significantly different activities.

4. Task Ordering
   - Process user requests first.
   - Place events at exact times.
   - Maintain project task sequence.
   - Group similar tasks when possible.

5. ID Management
   - Use exact IDs from input data.
   - Set IDs to null for new items.
   - Match tasks to the correct project/routine/event.

6. Block Type Determination:
   - When creating blocks from routines, use the routine's blockType property as the block's type.
   - When creating blocks from events, use the event's eventType property as the block's type.
   - For manually created blocks, choose an appropriate type based on the content and purpose.

${outputJsonFormat}`;
  }

  console.log("Using prompt text:", createSchedulePrompt);

  try {
    // Send the request to Anthropic with the selected prompt.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4096,
        temperature: 0.3,
        stream: true,
        messages: [
          {
            role: "user",
            content: createSchedulePrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      // Read and log the error details.
      const errorBody = await response.text();
      console.error(
        `Anthropic API error! Status: ${response.status}`,
        errorBody
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
    }

    // Create a TransformStream to process and forward the streaming response as SSE.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove the "data: " prefix
            if (data === "[DONE]") continue;
            try {
              const message = `data: ${data}\n\n`;
              controller.enqueue(encoder.encode(message));
            } catch (e) {
              console.error("Error processing chunk:", e);
              controller.error(e);
            }
          }
        }
      },
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return new Response(
      JSON.stringify({ message: "Error creating schedule" }),
      { status: 500 }
    );
  }
}
