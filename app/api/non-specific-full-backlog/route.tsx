// /app/api/generate-schedule/route.ts
import { NextRequest } from "next/server";

export const maxDuration = 60;

// Define the output JSON structure once.
const outputJsonFormat = `
Return ONLY a JSON object with this structure:
{
  "scheduleRationale": "Response to user explaining how their request was handled, any conflicts, suggestions, and clarifications.",
  "blocks": [
    {
      "name": "Clear context-appropriate name",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "blockDuration": number,
      "tasksDuration": number,
      "type": "deep-work" | "break" | "meeting" | "health" | "exercise" | "admin" | "personal",
      "routineId": "exact _id from routines or null",
      "tasks": [
        {
          "id": "existing-id-if-found or null",
          "name": "Task name",
          "duration": number,
          "projectId": "exact _id from projects or null",
          "routineId": "exact _id from routines or null",
          "eventId": "exact _id from events or null"
        }
      ]
    }
  ]
}`;

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
      createSchedulePrompt = `You are an expert scheduling assistant helping create a template schedule for a user who may have minimal saved data or vague requirements. Your goal is to create a well-structured day using evidence-based scheduling principles while keeping blocks and tasks generic enough to be easily customized.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"
Events (Must be honored): ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}
Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}

SCHEDULE CREATION PRIORITIES:
1. Fixed Commitments:
   - Place all events at their exact times; these cannot be moved.
   - Use only the provided routine IDs from the routines array; if a routine does not exist, set routineId to null.
   - Prioritize any tasks with urgent deadlines (e.g., due in the next 48 hours).
2. Context Analysis & Template Guidance:
   - Analyze the user input to determine the intended schedule type (e.g., study, work, exercise, personal).
   - If the user’s request is vague or minimal, choose one of the following template structures as a guide:
     • Study Template: Incorporate Planning/Review blocks (30–45 mins), Deep Focus blocks (45–60 mins), and Active Learning blocks (45–60 mins).  
       Example tasks: "Review upcoming deadlines", "Deep focus on primary subject", "Practice active recall techniques".
     • Work Template: Incorporate Planning blocks (30 mins), Deep Work blocks (60–90 mins), and Admin/Email blocks (30 mins).  
       Example tasks: "Plan the day", "Focused work on the main project", "Handle administrative tasks".
     • Exercise Template: Incorporate Preparation blocks (15–20 mins), Main Activity blocks (30–45 mins), and Recovery blocks (15–20 mins).  
       Example tasks: "Warm up and prepare", "Main workout session", "Cool down and recovery".
     • General Productivity Template: Incorporate Morning Setup (30 mins), Focus blocks (60 mins), and Review blocks (30 mins).  
       Example tasks: "Set daily objectives", "Work on priority items", "Review progress".
3. Time Integrity & Evidence-Based Scheduling:
   - Ensure there are no overlapping blocks and that start/end times are rounded to 30-minute intervals.
   - Block durations should align with the sum of their tasks’ durations.
   - Insert regular breaks (15–30 mins) after long work periods and add transition buffers (5–15 mins) where needed.
4. ID Management:
   - Use exact IDs from the input for events, routines, and projects.
   - For any new or placeholder items, set the corresponding IDs to null.
   - Validate all routineIds against the provided routineBlocks array.

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
     * Calculate tasksDuration as the sum of all tasks’ durations in that block.
     * **If the two values do not match, adjust task durations or block boundaries until they are identical.**
     * EXAMPLE: If a block runs from 10:00 to 11:30, then blockDuration = 90 minutes. Two tasks must sum exactly to 90 minutes (e.g., 50 and 40 minutes, not 60 and 60).
   - No gaps longer than 2 hours.
   - Include breaks after 2.5 hours of work.
2. Task Ordering
   - Process user requests first.
   - Place events at exact times.
   - Maintain project task sequence.
   - Group similar tasks when possible.
3. ID Management
   - Use exact IDs from input data.
   - Set IDs to null for new items.
   - Match tasks to the correct project/routine/event.

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
        model: "claude-3-sonnet-20240229",
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
      throw new Error(`HTTP error! status: ${response.status}`);
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

// import { NextRequest } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     return new Response(
//       JSON.stringify({ message: "Missing Anthropic API key" }),
//       { status: 500 }
//     );
//   }

//   console.log("this is the new one");
//   console.log("these are the routines", routineBlocks);
//   console.log("these are the events", eventBlocks);
//   console.log("these are the routines", tasks);
//   console.log("these are the routines", projects);
//   console.log("user Input", userInput);

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Block duration MUST equal the sum of task durations.
//      * For each block, calculate blockDuration as (endTime - startTime) in minutes.
//      * Calculate tasksDuration as the sum of all tasks’ durations in that block.
//      * **If the two values do not match, adjust the task durations or block boundaries until they are identical.**
//      * EXAMPLE: If a block runs from 10:00 to 11:30, then blockDuration = 90 minutes. If two tasks are included, their durations must sum exactly to 90 minutes. (e.g., 50 and 40 minutes, not 60 and 60.)   - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
//       "blockDuration": number,
//       "tasksDuration": must be exact calculation of all tasks within block,
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

//   try {
//     const response = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": apiKey,
//         "anthropic-version": "2023-06-01",
//         accept: "text/event-stream",
//       },
//       body: JSON.stringify({
//         model: "claude-3-sonnet-20240229",
//         max_tokens: 4096,
//         temperature: 0.3,
//         stream: true,
//         messages: [
//           {
//             role: "user",
//             content: createSchedulePrompt,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Create a TransformStream to process the stream
//     const encoder = new TextEncoder();
//     const decoder = new TextDecoder();

//     const transformStream = new TransformStream({
//       async transform(chunk, controller) {
//         const text = decoder.decode(chunk);
//         const lines = text.split("\n");

//         for (const line of lines) {
//           if (line.startsWith("data: ")) {
//             const data = line.slice(6); // Remove 'data: ' prefix
//             if (data === "[DONE]") continue;

//             try {
//               // Forward the parsed data to the client
//               const message = `data: ${data}\n\n`;
//               controller.enqueue(encoder.encode(message));
//             } catch (e) {
//               console.error("Error processing chunk:", e);
//               controller.error(e);
//             }
//           }
//         }
//       },
//     });

//     return new Response(response.body?.pipeThrough(transformStream), {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return new Response(
//       JSON.stringify({ message: "Error creating schedule" }),
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     return new Response(
//       JSON.stringify({ message: "Missing Anthropic API key" }),
//       { status: 500 }
//     );
//   }

//   console.log("this is the new one");
//   console.log("these are the routines", routineBlocks);
//   console.log("these are the events", eventBlocks);
//   console.log("these are the routines", tasks);
//   console.log("these are the routines", projects);
//   console.log("user Input", userInput);

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//   try {
//     const response = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": apiKey,
//         "anthropic-version": "2023-06-01",
//         accept: "text/event-stream",
//       },
//       body: JSON.stringify({
//         model: "claude-3-sonnet-20240229",
//         max_tokens: 4096,
//         temperature: 0.3,
//         stream: true,
//         messages: [
//           {
//             role: "user",
//             content: createSchedulePrompt,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Create a TransformStream to process the stream
//     const encoder = new TextEncoder();
//     const decoder = new TextDecoder();

//     const transformStream = new TransformStream({
//       async transform(chunk, controller) {
//         const text = decoder.decode(chunk);
//         const lines = text.split("\n");

//         for (const line of lines) {
//           if (line.startsWith("data: ")) {
//             const data = line.slice(6); // Remove 'data: ' prefix
//             if (data === "[DONE]") continue;

//             try {
//               // Forward the parsed data to the client
//               const message = `data: ${data}\n\n`;
//               controller.enqueue(encoder.encode(message));
//             } catch (e) {
//               console.error("Error processing chunk:", e);
//               controller.error(e);
//             }
//           }
//         }
//       },
//     });

//     return new Response(response.body?.pipeThrough(transformStream), {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return new Response(
//       JSON.stringify({ message: "Error creating schedule" }),
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { message: "Missing Anthropic API key" },
//       { status: 500 }
//     );
//   }

//   console.log("this is the new one");
//   console.log("these are the routines", routineBlocks);
//   console.log("these are the events", eventBlocks);
//   console.log("these are the routines", tasks);
//   console.log("these are the routines", projects);
//   console.log("user Input", userInput);

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//   try {
//     const response = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": apiKey,
//         "anthropic-version": "2023-06-01",
//         accept: "text/event-stream",
//       },
//       body: JSON.stringify({
//         model: "claude-3-sonnet-20240229",
//         max_tokens: 4096,
//         temperature: 0.3,
//         stream: true,
//         messages: [
//           {
//             role: "user",
//             content: createSchedulePrompt,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const reader = response.body?.getReader();
//     const decoder = new TextDecoder();
//     let completeJSON = "";
//     let isCollectingJSON = false;

//     if (!reader) {
//       throw new Error("No reader available");
//     }

//     // Read the stream
//     while (true) {
//       const { done, value } = await reader.read();

//       if (done) {
//         console.log("Stream complete");
//         break;
//       }

//       // Decode the chunk
//       const chunk = decoder.decode(value);
//       console.log("Raw chunk:", chunk);

//       // Parse the SSE data
//       const lines = chunk.split("\n");
//       for (const line of lines) {
//         if (line.startsWith("data: ")) {
//           const data = line.slice(6); // Remove 'data: ' prefix
//           if (data === "[DONE]") {
//             console.log("Stream completed");
//             continue;
//           }
//           try {
//             const parsed = JSON.parse(data);
//             console.log("Parsed message:", parsed);

//             // Handle content block deltas
//             if (
//               parsed.type === "content_block_delta" &&
//               parsed.delta?.type === "text_delta"
//             ) {
//               const text = parsed.delta.text;

//               // Start collecting when we see the opening brace
//               if (text.includes("{")) {
//                 isCollectingJSON = true;
//               }

//               if (isCollectingJSON) {
//                 completeJSON += text;
//               }
//             }
//           } catch (e) {
//             console.error("Error parsing JSON in stream:", e);
//           }
//         }
//       }
//     }

//     // Clean up the collected JSON
//     completeJSON = completeJSON.trim();
//     console.log("Complete JSON string:", completeJSON);

//     // Parse the complete response as JSON
//     try {
//       const schedule = JSON.parse(completeJSON);
//       return NextResponse.json(schedule);
//     } catch (parseError) {
//       console.error("Error parsing final JSON:", parseError);
//       console.error("Received content:", completeJSON);
//       throw new Error("Invalid JSON response from Anthropic API");
//     }
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return NextResponse.json(
//       { message: "Error creating schedule" },
//       { status: 500 }
//     );
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { promiseHooks } from "v8";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { message: "Missing Anthropic API key" },
//       { status: 500 }
//     );
//   }

//   console.log("this is the new one");
//   console.log("these are the routines", routineBlocks);
//   console.log("these are the events", eventBlocks);
//   console.log("these are the routines", tasks);
//   console.log("these are the routines", projects);
//   console.log("user Input", userInput);

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//   try {
//     const schedule = await getAnthropicResponse(apiKey, createSchedulePrompt);

//     return NextResponse.json(schedule);
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return NextResponse.json(
//       { message: "Error creating schedule" },
//       { status: 500 }
//     );
//   }
// }

// async function getAnthropicResponse(apiKey: string, prompt: string) {
//   const response = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": apiKey,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model: "claude-3-sonnet-20240229",
//       max_tokens: 4096, // Increased from 1024 to 4096
//       temperature: 0.3,
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     }),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error(`Anthropic API error: ${response.status}`, errorText);
//     throw new Error(`Anthropic API error: ${errorText}`);
//   }

//   const data = await response.json();
//   const content = data.content[0].text;

//   try {
//     return JSON.parse(content);
//   } catch (parseError) {
//     console.error("Error parsing JSON:", parseError);
//     console.error("Received content:", content);
//     throw new Error("Invalid JSON response from Anthropic API");
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   try {
//     const {
//       eventBlocks,
//       routineBlocks,
//       tasks,
//       projects,
//       userInput,
//       startTime,
//       endTime,
//     } = await request.json();

//     const apiKey = process.env.OPENAI_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { message: "Missing OpenAI API key" },
//         { status: 500 }
//       );
//     }

//     console.log("Starting OpenAI schedule generation...");

//     const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks:
// ${JSON.stringify(projects, null, 2)}

// Events:
// ${JSON.stringify(eventBlocks, null, 2)}

// Routines:
// ${JSON.stringify(routineBlocks, null, 2)}

// Standalone Tasks:
// ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Details any gaps longer than 2 hours and why they exist
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//     console.log("Sending request to OpenAI...");
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "o1-preview",
//         messages: [
//           {
//             role: "user",
//             content: createSchedulePrompt,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`OpenAI API error: ${response.status}`, errorText);
//       return NextResponse.json(
//         { message: `OpenAI API error: ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log("Raw OpenAI response:", data);

//     // Extract the response content
//     const content = data.choices[0]?.message?.content;

//     if (!content) {
//       throw new Error("No valid content found in OpenAI response");
//     }

//     // Clean and parse the response content as JSON
//     const cleanedContent = content.replace(/```json|```/g, "").trim();

//     try {
//       const schedule = JSON.parse(cleanedContent);
//       console.log("Parsed schedule:", schedule);
//       return NextResponse.json(schedule);
//     } catch (parseError) {
//       console.error("JSON parse error:", parseError);
//       return NextResponse.json(
//         {
//           message: "Invalid JSON in OpenAI response",
//           rawContent: cleanedContent,
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("Detailed error:", error);
//     return NextResponse.json(
//       { message: "Error creating schedule" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { message: "Missing OpenAI API key" },
//       { status: 500 }
//     );
//   }

//   console.log("Starting OpenAI schedule generation...");

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Details any gaps longer than 2 hours and why they exist
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//   try {
//     console.log("Sending request to OpenAI...");
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "o1-preview",
//         messages: [
//           {
//             role: "user",
//             content: createSchedulePrompt,
//           },
//         ],
//         response_format: { type: "json_object" },
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`OpenAI API error: ${response.status}`, errorText);
//       return NextResponse.json(
//         { message: `OpenAI API error: ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log("Raw OpenAI response:", data);

//     const schedule = JSON.parse(data.choices[0].message.content);
//     console.log("Parsed schedule:", schedule);

//     return NextResponse.json(schedule);
//   } catch (error) {
//     console.error("Detailed error:", error);
//     return NextResponse.json(
//       { message: "Error creating schedule" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { message: "Missing OpenAI API key" },
//       { status: 500 }
//     );
//   }

//   console.log("Testing OpenAI o1 connection...");

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "o1-preview",
//         messages: [
//           {
//             role: "user",
//             content: "Say hello and confirm you can create schedules",
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`OpenAI API error: ${response.status}`, errorText);
//       return NextResponse.json(
//         { message: `OpenAI API error: ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log("OpenAI Response:", data); // Log the full response
//     console.log("Message content:", data.choices[0].message.content); // Log just the message

//     return NextResponse.json({ message: data.choices[0].message.content });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return NextResponse.json(
//       { message: "Error connecting to OpenAI" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const {
//     eventBlocks,
//     routineBlocks,
//     tasks,
//     projects,
//     userInput,
//     startTime,
//     endTime,
//   } = await request.json();

//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { message: "Missing OpenAI API key" },
//       { status: 500 }
//     );
//   }

//   console.log("running open ai o1");

//   const createSchedulePrompt = `You are an expert scheduling assistant. Create a schedule based on the following data while respecting time constraints and task relationships.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL RULES:
// 1. Time Integrity
//    - No overlapping blocks
//    - Round times to 30-minute intervals
//    - Block duration MUST equal sum of task durations
//    - No gaps longer than 2 hours
//    - Include breaks after 2.5 hours of work

// 2. Task Ordering
//    - Process user requests first
//    - Place events at exact times
//    - Maintain project task sequence
//    - Group similar tasks when possible

// 3. ID Management
//    - Use exact IDs from input data
//    - Set IDs to null for new items
//    - Match tasks to correct project/routine/event

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining:
//    - How their specific requests were handled
//    - Any scheduling conflicts or issues
//    - Details any gaps longer than 2 hours and why they exist
//    - Suggestions for clearer future requests
//    - What needs clarification",
//   "blocks": [
//     {
//       "name": "Clear context-appropriate name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
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

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "o1-preview",
//         messages: [
//           {
//             role: "user",
//             content:
//               "You are an expert scheduling assistant that creates detailed daily schedules. You output only valid JSON objects.\n\n" +
//               createSchedulePrompt,
//           },
//         ],
//         // temperature: 0.3,
//         // max_tokens: 4096,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`OpenAI API error: ${response.status}`, errorText);
//       return NextResponse.json(
//         { message: `OpenAI API error: ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     const schedule = JSON.parse(data.choices[0].message.content);

//     return NextResponse.json(schedule);
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return NextResponse.json(
//       { message: "Error creating schedule" },
//       { status: 500 }
//     );
//   }
// }

//   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your primary goal is to create a valid schedule that strictly enforces time constraints and task ordering requirements.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL VALIDATION RULES:
// 1. Block Duration Rule (MOST IMPORTANT)
//    - Block duration MUST equal sum of contained task durations
//    - Calculate total task duration before creating any block
//    - If tasks would exceed block time, create new block
//    - Never place tasks without verifying duration constraint
//    - Example: 60-minute block must contain exactly 60 minutes of tasks

// 2. Project Task Sequence (NEVER VIOLATE)
//    - Every project task has a sequence number (0,1,2...)
//    - Tasks MUST be scheduled in exact sequence order
//    - Cannot place task n before task n-1
//    - If sequence impossible, report in scheduleRationale

// 3. Time Block Integrity
//    - No blocks can overlap
//    - All times must be rounded to 30-minute intervals
//    - Minimum block duration: 25 minutes
//    - Tasks must fit within their specified time windows
//    - Events cannot be moved from specified times unless user requests

// SCHEDULING PRIORITY ORDER:
// 1. User Input (ABSOLUTE HIGHEST PRIORITY)
//    - Always process user's explicit requests first
//    - User modifications override ALL existing data
//    - Handle these cases:
//      a. Event Modifications:
//         * Modified events: Keep eventId, use new time/duration
//         * New events: Set eventId=null, isEvent=true
//         * Override any conflicting database events
//      b. Task Scheduling:
//         * Exact times specified by user
//         * Modified task properties
//         * New tasks (set taskId=null)
//      c. Routine Changes:
//         * Modified routines: Keep routineId, use new window
//         * New routines: Set routineId=null, copy tasks
//         * Honor user's time preferences

// 2. Remaining Fixed Commitments
//    - Unmodified events from database
//    - Hard deadline tasks (due within 24h)

// 3. Routine Integration
//    - Place in preferred time windows
//    - Keep exact routine names
//    - Maintain original task sequence
//    - Set isRoutine=true and use original routineId

// 4. Project Task Scheduling
//    - Process one project at a time
//    - Every project task has a sequence number (0,1,2...)
//    - Tasks MUST be scheduled in exact sequence order throughout the day
//    - When block would exceed duration:
//      * End current block
//      * Create new block
//      * Continue with next task
//    - Set projectId and maintain original task IDs

// 5. Standalone Task Integration
//    - Priority order: High → Medium → Low
//    - Group similar tasks when possible
//    - Respect time windows if specified
//    - Set isStandaloneBlock=true

// 6. Break Integration
//    - Required after 2.5 hours continuous work
//    - 5-15 minutes between different task types
//    - 30-60 minutes for lunch
//    - Skip if near existing break-like routine

// ERROR PREVENTION:
// 1. Before Creating Block:
//    - Sum all task durations
//    - Verify sum matches intended block duration
//    - Confirm no time overlaps
//    - Validate all task IDs exist

// 2. Before Adding Task:
//    - Verify task exists in input data
//    - Confirm task fits in remaining block time
//    - Check task ordering for projects
//    - Validate time window constraints

// CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
// {
//   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation focusing on:
//     - User input processing results
//     - How block durations were validated
//     - Project task order maintenance
//     - Any scheduling conflicts
//     - Unscheduled tasks and why",
//   "blocks": [
//     {
//       "name": "Clear descriptive name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
//       "description": "Block purpose and evidence-based placement rationale",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": "MUST use exact _id from input Event when isRoutine is true or null",
//       "routineId": "MUST use exact _id from input Routine when isRoutine is trueor null",
//       "blockType": "deep-work" | "planning" | "break" | "admin" | "collaboration",
//       "tasks": [
//         {
//           "id": "original_task_id or null",
//           "name": string,
//           "description": string,
//           "duration": number,
//           "priority": "High" | "Medium" | "Low",
//           "isRoutineTask": boolean,
//           "projectId": "original_project_id or null",
//           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
//           "isUserSpecified": boolean
//         }
//       ]
//     }
//   ]
// }`;

//   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your primary goal is to create a valid schedule that strictly enforces time constraints and task ordering requirements.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// CRITICAL VALIDATION RULES:
// 1. Block Duration Rule (MOST IMPORTANT)
//    - Block duration MUST equal sum of contained task durations
//    - Calculate total task duration before creating any block
//    - If tasks would exceed block time, create new block
//    - Never place tasks without verifying duration constraint
//    - Example: 60-minute block must contain exactly 60 minutes of tasks

// 2. Project Task Sequence (NEVER VIOLATE)
//    - Every project task has a sequence number (0,1,2...)
//    - Tasks MUST be scheduled in exact sequence order
//    - Cannot place task n before task n-1
//    - If sequence impossible, report in scheduleRationale

// 3. Time Block Integrity
//    - No blocks can overlap
//    - All times must be rounded to 30-minute intervals
//    - Minimum block duration: 25 minutes
//    - Tasks must fit within their specified time windows
//    - Events cannot be moved from specified times unless user requests

// SCHEDULING PRIORITY ORDER:
// 1. User Input (ABSOLUTE HIGHEST PRIORITY)
//    - Always process user's explicit requests first
//    - User modifications override ALL existing data
//    - Handle these cases:
//      a. Event Modifications:
//         * Modified events: Keep eventId, use new time/duration
//         * New events: Set eventId=null, isEvent=true
//         * Override any conflicting database events
//      b. Task Scheduling:
//         * Exact times specified by user
//         * Modified task properties
//         * New tasks (set taskId=null)
//      c. Routine Changes:
//         * Modified routines: Keep routineId, use new window
//         * New routines: Set routineId=null, copy tasks
//         * Honor user's time preferences

// 2. Remaining Fixed Commitments
//    - Unmodified events from database
//    - Hard deadline tasks (due within 24h)

// 3. Routine Integration
//    - Place in preferred time windows
//    - Keep exact routine names
//    - Maintain original task sequence
//    - Set isRoutine=true and use original routineId

// 4. Project Task Scheduling
//    - Process one project at a time
//    - Maintain exact task order within each project
//    - When block would exceed duration:
//      * End current block
//      * Create new block
//      * Continue with next task
//    - Set projectId and maintain original task IDs

// 5. Standalone Task Integration
//    - Priority order: High → Medium → Low
//    - Group similar tasks when possible
//    - Respect time windows if specified
//    - Set isStandaloneBlock=true

// 6. Break Integration
//    - Required after 2.5 hours continuous work
//    - 5-15 minutes between different task types
//    - 30-60 minutes for lunch
//    - Skip if near existing break-like routine

// ERROR PREVENTION:
// 1. Before Creating Block:
//    - Sum all task durations
//    - Verify sum matches intended block duration
//    - Confirm no time overlaps
//    - Validate all task IDs exist

// 2. Before Adding Task:
//    - Verify task exists in input data
//    - Confirm task fits in remaining block time
//    - Check task ordering for projects
//    - Validate time window constraints

// CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
// {
//   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation focusing on:
//     - User input processing results
//     - How block durations were validated
//     - Project task order maintenance
//     - Any scheduling conflicts
//     - Unscheduled tasks and why",
//   "blocks": [
//     {
//       "name": "Clear descriptive name",
//       "startTime": "HH:MM",
//       "endTime": "HH:MM",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": "MUST use exact _id from input Event when isRoutine is true",
//       "routineId": "MUST use exact _id from input Routine when isRoutine is true",
//       "tasks": [
//         {
//           "id": "original_task_id or null",
//           "name": string,
//           "description": string,
//           "duration": number,
//           "priority": "High" | "Medium" | "Low",
//           "isRoutineTask": boolean,
//           "projectId": "original_project_id or null",
//           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
//           "isUserSpecified": boolean
//         }
//       ]
//     }
//   ]
// }`;

//   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// Available Data Structure:
// 1. Time Frame: Specified start and end times for scheduling
// 2. Events: Fixed calendar commitments with specific times
// 3. Routines: Collections of recurring tasks with preferred time windows
// 4. Projects: Collections of ordered tasks working toward specific goals
// 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
// 6. User Input: Specific scheduling requests and modifications

// GENERAL RULES:

// 1. Block & Task Integrity:
// - CRITICAL: The block's end time minus start time MUST be greater than or equal to the sum of all task durations within that block
// - Calculate sum of task durations before placing in block
// - If tasks would exceed block duration, create a new block
// - All tasks must be contained within a time block
// - No time blocks can overlap at any point
// - Never create tasks that don't exist in input data
//   * Exception: Break blocks can be created
//   * Exception: "Free Time" blocks for gaps

// 2. Time Management:
// - Round all times to nearest 30 minutes for clarity
// - Minimum block duration: 25 minutes
// - Include 5-15 minute transitions between different types of work
// - Maximum continuous work without break: 2.5 hours

// 3. Data Integrity:
// - Never modify original task properties except:
//   * Priority adjustments for deadline tasks
//   * Setting isUserSpecified flag
// - Maintain all original IDs when using existing items
// - Set IDs to null for new items
// - Preserve exact names of events and routines

// 4. Block Creation Rules:
// - Every block must have:
//   * Clear descriptive name
//   * Precise start and end times
//   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
//   * Appropriate ID references
// - Task grouping only allowed for:
//   * Similar deadline-driven tasks
//   * Related administrative work
//   * Tasks from same project

// 5. Task Placement Constraints:
// - CRITICAL: Project tasks MUST be scheduled in the exact order they appear in the projects array
//   * This order has been set by the user through drag-and-drop
//   * Never reorder tasks within a project for any reason
//   * If a task cannot fit in current block, create new block but maintain order
// - Tasks must be scheduled within their specified time windows
// - Other optimizations (energy patterns, cognitive load) only apply to non-project tasks

// 6. Break & Buffer Management:
// - Only create break blocks when needed
// - Skip break creation near existing break-like routines
// - Maintain small buffers between different task types
// - Include preparation time before important events

// SCHEDULING PROCESS:

// 1. Process User Input
// - Parse schedule-specific instructions only
// - Honor explicit time requests ("Task A at 10:00")
// - For event modifications:
//   * If user changes time/duration of existing event: Keep original eventId
//   * If user creates new event: Set eventId to null, set isEvent to true
//   * Place at user-specified time, or if none given, use event's original time
// - For routine handling:
//   * Create new block with routine name
//   * For existing routines: Set routineId to routine being duplicated
//   * For new routines: Set routineId to null
//   * Replicate all tasks from routine:
//     - Copy task names and properties
//     - Set isRoutineTask=true for all tasks
//   * Set isRoutine=true for block
// - For task requests:
//   * Search projects and standalone tasks for matches
//   * If matching existing task: Set taskId to original task's ID
//   * If new task: Set taskId to null
//   * Add to schedule in specified time slot

// 2. Handle Fixed Commitments
// Events:
// - Schedule all events at their exact specified times
// - For events in schedule:
//   * Set eventId from original event
//   * Set isEvent to true
//   * Maintain all original event properties
// - For conflicts with user-specified events:
//   * Place conflicting event as close as possible to original time
//   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
//   * Maintain original eventId and isEvent=true
//   * Add note in scheduleRationale about conflict

// Deadline-Critical Tasks:
// - Prioritize tasks due within next 24 hours
// - Task placement rules:
//   * Must be scheduled within task's specified time window
//   * Can only be moved if conflicting with:
//     - Fixed events
//     - User-specified task times
//     - Higher priority deadline tasks
// - Task grouping strategy:
//   * Group similar short-deadline tasks into single blocks
//     - Example: Combine multiple admin tasks
//     - Example: Group related communications
//   * Maximum grouped block duration: 2 hours
//   * Maintain individual task properties within groups
// - For each deadline task:
//   * Maintain original taskId
//   * Set priority to "High"
//   * Include buffer time if specified in task requirements

// 3. Integrate Routines
// - Place routines in preferred time windows
// - Create blocks with routine names
// - Set routineId and isRoutine flags
// - Replicate routine tasks with null IDs
// - Only modify if:
//   * User explicitly requests
//   * Unavoidable conflict exists

// 4. Project Task Integration
// - CRITICAL: USER-DEFINED TASK ORDER
//   * The order of tasks in each project array is sacred - it represents user choices made through drag-and-drop
//   * Never change this order even if it would create a "better" schedule
//   * If tasks don't fit in one block, split into multiple blocks but maintain absolute order
// - For each project:
//   * Process tasks one by one in exact array order
//   * When task duration sum would exceed block time:
//     - Close current block
//     - Create new block with incremental name (e.g., "Project Name: Part 1")
//     - Continue with next task in sequence
// - Additional considerations are secondary to maintaining user's chosen order

// 5. Break Integration
// - Insert strategic breaks between task blocks
// - Break types and durations:
//   * Micro-breaks (5-10 minutes) between regular tasks
//   * Recovery breaks (15-30 minutes) between deep work
//   * Lunch break (30-60 minutes) mid-day
//   * Skip break insertion if routine break exists
// - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
// - Do not place breaks next to user routines that seem to act as a break

// 6. Gap Management
// - Identify gaps ≥ 30 minutes
// - Label substantial gaps as "Free Time"
// - Keep shorter gaps as flexibility buffers

// CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
// {
//   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation of key decisions and conflicts",
//   "blocks": [
//     {
//       "name": "Block name",
//       "startTime": "HH:MM format",
//       "endTime": "HH:MM format",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": string or null,
//       "routineId": "MUST use exact _id from input routine when isRoutine is true"
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
//         }
//       ]
//     }
//   ]
// }`;

//   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// Available Data Structure:
// 1. Time Frame: Specified start and end times for scheduling
// 2. Events: Fixed calendar commitments with specific times
// 3. Routines: Collections of recurring tasks with preferred time windows
// 4. Projects: Collections of ordered tasks working toward specific goals
// 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
// 6. User Input: Specific scheduling requests and modifications

// GENERAL RULES:

// 1. Block & Task Integrity:
// - All tasks must be contained within a time block
// - No time blocks can overlap at any point
// - Total duration of tasks in a block must exactly match block duration
// - Never create tasks that don't exist in input data
//   * Exception: Break blocks can be created
//   * Exception: "Free Time" blocks for gaps

// 2. Time Management:
// - Round all times to nearest 30 minutes for clarity
// - Minimum block duration: 25 minutes
// - Include 5-15 minute transitions between different types of work
// - Maximum continuous work without break: 2.5 hours

// 3. Data Integrity:
// - Never modify original task properties except:
//   * Priority adjustments for deadline tasks
//   * Setting isUserSpecified flag
// - Maintain all original IDs when using existing items
// - Set IDs to null for new items
// - Preserve exact names of events and routines

// 4. Block Creation Rules:
// - Every block must have:
//   * Clear descriptive name
//   * Precise start and end times
//   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
//   * Appropriate ID references
// - Task grouping only allowed for:
//   * Similar deadline-driven tasks
//   * Related administrative work
//   * Tasks from same project

// 5. Task Placement Constraints:
// - Tasks must be scheduled within their specified time windows
// - Project tasks must maintain their array order
// - Deep work tasks require peak energy times
// - Consider cognitive load and task relationships

// 6. Break & Buffer Management:
// - Only create break blocks when needed
// - Skip break creation near existing break-like routines
// - Maintain small buffers between different task types
// - Include preparation time before important events

// SCHEDULING PROCESS:

// 1. Process User Input
// - Parse schedule-specific instructions only
// - Honor explicit time requests ("Task A at 10:00")
// - For event modifications:
//   * If user changes time/duration of existing event: Keep original eventId
//   * If user creates new event: Set eventId to null, set isEvent to true
//   * Place at user-specified time, or if none given, use event's original time
// - For routine handling:
//   * Create new block with routine name
//   * For existing routines: Set routineId to routine being duplicated
//   * For new routines: Set routineId to null
//   * Replicate all tasks from routine:
//     - Copy task names and properties
//     - Set isRoutineTask=true for all tasks
//   * Set isRoutine=true for block
// - For task requests:
//   * Search projects and standalone tasks for matches
//   * If matching existing task: Set taskId to original task's ID
//   * If new task: Set taskId to null
//   * Add to schedule in specified time slot

// 2. Handle Fixed Commitments
// Events:
// - Schedule all events at their exact specified times
// - For events in schedule:
//   * Set eventId from original event
//   * Set isEvent to true
//   * Maintain all original event properties
// - For conflicts with user-specified events:
//   * Place conflicting event as close as possible to original time
//   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
//   * Maintain original eventId and isEvent=true
//   * Add note in scheduleRationale about conflict

// Deadline-Critical Tasks:
// - Prioritize tasks due within next 24 hours
// - Task placement rules:
//   * Must be scheduled within task's specified time window
//   * Can only be moved if conflicting with:
//     - Fixed events
//     - User-specified task times
//     - Higher priority deadline tasks
// - Task grouping strategy:
//   * Group similar short-deadline tasks into single blocks
//     - Example: Combine multiple admin tasks
//     - Example: Group related communications
//   * Maximum grouped block duration: 2 hours
//   * Maintain individual task properties within groups
// - For each deadline task:
//   * Maintain original taskId
//   * Set priority to "High"
//   * Include buffer time if specified in task requirements

// 3. Integrate Routines
// - Place routines in preferred time windows
// - Create blocks with routine names
// - Set routineId and isRoutine flags
// - Replicate routine tasks with null IDs
// - Only modify if:
//   * User explicitly requests
//   * Unavoidable conflict exists

// 4. Project Task Integration
// - Prioritize project tasks as goal-oriented work
// - Create 90-minute deep work blocks (based on cognitive research)
// - Place during peak energy periods:
//   * Morning: 9:00-12:00 (typically highest focus)
//   * Early Afternoon: 14:00-16:00 (post-recovery)
// - Maintain task order from project array
// - Maximum 2 deep work blocks before requiring substantial break
// - Include 15-minute context switching time between projects

// 5. Break Integration
// - Insert strategic breaks between task blocks
// - Break types and durations:
//   * Micro-breaks (5-10 minutes) between regular tasks
//   * Recovery breaks (15-30 minutes) between deep work
//   * Lunch break (30-60 minutes) mid-day
//   * Skip break insertion if routine break exists
// - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
// - Do not place breaks next to user routines that seem to act as a break

// 6. Gap Management
// - Identify gaps ≥ 30 minutes
// - Label substantial gaps as "Free Time"
// - Keep shorter gaps as flexibility buffers

// CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
// {
//   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation of key decisions and conflicts",
//   "blocks": [
//     {
//       "name": "Block name",
//       "startTime": "HH:MM format",
//       "endTime": "HH:MM format",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": string or null,
//       "routineId": "MUST use exact _id from input routine when isRoutine is true"
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
//         }
//       ]
//     }
//   ]
// }`;

// const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

// AVAILABLE DATA:
// Time Frame: \${startTime} to \${endTime}
// User Request: "\${userInput}"

// Projects and Their Tasks: \${JSON.stringify(projects, null, 2)}
// Events: \${JSON.stringify(eventBlocks, null, 2)}
// Routines: \${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: \${JSON.stringify(tasks, null, 2)}

// Available Data Structure:
// 1. Time Frame: Specified start and end times for scheduling
// 2. Events: Fixed calendar commitments with specific times
// 3. Routines: Collections of recurring tasks with preferred time windows
// 4. Projects: Collections of ordered tasks working toward specific goals
// 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
// 6. User Input: Specific scheduling requests and modifications

// GENERAL RULES:

// 1. Block & Task Integrity:
// - All tasks must be contained within a time block
// - No time blocks can overlap at any point
// - Total duration of tasks in a block must exactly match block duration
// - Never create tasks that don't exist in input data
//   * Exception: Break blocks can be created
//   * Exception: "Free Time" blocks for gaps

// 2. Time Management:
// - Round all times to nearest 30 minutes for clarity
// - Minimum block duration: 25 minutes
// - Include 5-15 minute transitions between different types of work
// - Maximum continuous work without break: 2.5 hours

// 3. Data Integrity:
// - Never modify original task properties except:
//   * Priority adjustments for deadline tasks
//   * Setting isUserSpecified flag
// - Maintain all original IDs when using existing items
// - Set IDs to null for new items
// - Preserve exact names of events and routines

// 4. Block Creation Rules:
// - Every block must have:
//   * Clear descriptive name
//   * Precise start and end times
//   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
//   * Appropriate ID references
// - Task grouping only allowed for:
//   * Similar deadline-driven tasks
//   * Related administrative work
//   * Tasks from same project

// 5. Task Placement Constraints:
// - Tasks must be scheduled within their specified time windows
// - Project tasks must maintain their array order
// - Deep work tasks require peak energy times
// - Consider cognitive load and task relationships

// 6. Break & Buffer Management:
// - Only create break blocks when needed
// - Skip break creation near existing break-like routines
// - Maintain small buffers between different task types
// - Include preparation time before important events

// SCHEDULING PROCESS:

// 1. Process User Input
// - Parse schedule-specific instructions only
// - Honor explicit time requests ("Task A at 10:00")
// - For event modifications:
//   * If user changes time/duration of existing event: Keep original eventId
//   * If user creates new event: Set eventId to null, set isEvent to true
//   * Place at user-specified time, or if none given, use event's original time
// - For routine handling:
//   * Create new block with routine name
//   * For existing routines: Set routineId to routine being duplicated
//   * For new routines: Set routineId to null
//   * Replicate all tasks from routine:
//     - Copy task names and properties
//     - Set isRoutineTask=true for all tasks
//   * Set isRoutine=true for block
// - For task requests:
//   * Search projects and standalone tasks for matches
//   * If matching existing task: Set taskId to original task's ID
//   * If new task: Set taskId to null
//   * Add to schedule in specified time slot

// 2. Handle Fixed Commitments
// Events:
// - Schedule all events at their exact specified times
// - For events in schedule:
//   * Set eventId from original event
//   * Set isEvent to true
//   * Maintain all original event properties
// - For conflicts with user-specified events:
//   * Place conflicting event as close as possible to original time
//   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
//   * Maintain original eventId and isEvent=true
//   * Add note in scheduleRationale about conflict

// Deadline-Critical Tasks:
// - Prioritize tasks due within next 24 hours
// - Task placement rules:
//   * Must be scheduled within task's specified time window
//   * Can only be moved if conflicting with:
//     - Fixed events
//     - User-specified task times
//     - Higher priority deadline tasks
// - Task grouping strategy:
//   * Group similar short-deadline tasks into single blocks
//     - Example: Combine multiple admin tasks
//     - Example: Group related communications
//   * Maximum grouped block duration: 2 hours
//   * Maintain individual task properties within groups
// - For each deadline task:
//   * Maintain original taskId
//   * Set priority to "High"
//   * Include buffer time if specified in task requirements

// 3. Integrate Routines
// - Place routines in preferred time windows
// - Create blocks with routine names
// - Set routineId and isRoutine flags
// - Replicate routine tasks with null IDs
// - Only modify if:
//   * User explicitly requests
//   * Unavoidable conflict exists

// 4. Project Task Integration
// - Prioritize project tasks as goal-oriented work
// - Create 90-minute deep work blocks (based on cognitive research)
// - Place during peak energy periods:
//   * Morning: 9:00-12:00 (typically highest focus)
//   * Early Afternoon: 14:00-16:00 (post-recovery)
// - Maintain task order from project array
// - Maximum 2 deep work blocks before requiring substantial break
// - Include 15-minute context switching time between projects

// 5. Break Integration
// - Insert strategic breaks between task blocks
// - Break types and durations:
//   * Micro-breaks (5-10 minutes) between regular tasks
//   * Recovery breaks (15-30 minutes) between deep work
//   * Lunch break (30-60 minutes) mid-day
//   * Skip break insertion if routine break exists
// - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
// - Do not place breaks next to user routines that seem to act as a break

// 6. Gap Management
// - Identify gaps ≥ 30 minutes
// - Label substantial gaps as "Free Time"
// - Keep shorter gaps as flexibility buffers

// Return ONLY a JSON object with this structure:
// {
//   "currentTime": "\${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation of key decisions and conflicts",
//   "blocks": [
//     {
//       "name": "Block name",
//       "startTime": "HH:MM format",
//       "endTime": "HH:MM format",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": string or null,
//       "routineId": "MUST use exact _id from input routine when isRoutine is true"
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
//         }
//       ]
//     }
//   ]
// }`;

//   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following a strict priority system while respecting all time constraints.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
// Events: ${JSON.stringify(eventBlocks, null, 2)}
// Routines: ${JSON.stringify(routineBlocks, null, 2)}
// Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

// SCHEDULING PROCESS:
// Follow this exact order when building the schedule:

// 1. Initial Setup Phase:
// - Validate all time windows and durations
// - Ensure all tasks have required fields
// - Calculate total available time

// 2. Fixed Time Blocks (Highest Priority):
// - Place all events at their exact specified times
// - Events cannot be moved or modified
// - Mark these times as unavailable

// 3. Deadline-Critical Tasks:
// - Place tasks with deadlines within 24-48 hours
// - Must schedule within task's specified time window
// - Add to unscheduled list if cannot fit within window
// - Note deadline conflicts in schedule rationale

// 4. User-Specified Items:
// - Parse user's explicit scheduling requests
// - Place mentioned tasks/projects/routines
// - Must respect each item's time window
// - Flag any unfulfilled requests for explanation

// 5. Routine Integration:
// - Place routines within their specified time windows
// - Keep exact routine names and IDs
// - Never modify routine tasks or create new ones
// - Block duration must match sum of routine tasks
// - Add to unscheduled list if cannot fit in window

// 6. Remaining Task Integration:
// - Process other tasks based on:
//   * Priority level
//   * Task relationships (same project/type)
//   * Time window constraints
//   * Energy patterns (complex tasks in morning)
// - Group related tasks when possible
// - Never create tasks that don't exist in input data

// 7. Break Planning:
// - Maximum 2.5 hours of deep work without breaks
// - Minimum 15-minute breaks between work sessions
// - Use routine breaks where available
// - Add additional breaks where needed

// 8. Gap Analysis:
// - Identify gaps longer than 30 minutes
// - For longer gaps, create "Free Time" blocks
// - Never invent new tasks to fill gaps

// VALIDATION RULES:
// 1. Blocks must never overlap
// 2. Each block's duration must exactly match the sum of its tasks
// 3. Every task must be scheduled within its specified time window
// 4. Routines must maintain their exact structure and timing windows
// 5. Never create tasks that don't exist in the input data
// 6. Always include breaks between deep work sessions

// Return ONLY a JSON object with this structure:
// {
//   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
//   "scheduleRationale": "Brief explanation of key decisions and conflicts",
//   "blocks": [
//     {
//       "name": "Block name",
//       "startTime": "HH:MM format",
//       "endTime": "HH:MM format",
//       "isEvent": boolean,
//       "isRoutine": boolean,
//       "isStandaloneBlock": boolean,
//       "eventId": string or null,
//       "routineId": "MUST use exact _id from input routine when isRoutine is true"
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
//         }
//       ]
//     }
//   ]
// }`;

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
