import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userInput, startTime, endTime } = await request.json();

  console.log("is the home-page-non-specific running");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ message: "Missing Anthropic API key" }),
      { status: 500 }
    );
  }

  const createSchedulePrompt = `You are an expert scheduling assistant creating a template schedule for a first‑time trial user. Since this user has no pre‑existing data, your task is to generate a schedule solely based on the provided time frame and user request. Your goal is to create a well‑structured day using evidence‑based scheduling principles. If the user’s request is specific, incorporate their instructions. Otherwise, select one of the following common templates as a guide:

AVAILABLE DATA:
  • Time Frame: ${startTime} to ${endTime}
  • User Request: "${userInput}"

SCHEDULE CREATION PRIORITIES:
1. User Request Analysis:
   - If the user’s request contains specific details (e.g., exact times, named activities, or particular preferences), honor those specifics.
   - If the request is vague or general, choose one of the following template structures as a guide:
     • **Study Template:** Include Planning/Review blocks (30–45 mins), Deep Focus blocks (45–60 mins), and Active Learning blocks (45–60 mins).  
       *Example tasks:* "Review upcoming deadlines", "Deep focus on primary subject", "Practice active recall techniques."
     • **Work Template:** Include Planning blocks (30 mins), Deep Work blocks (60–90 mins), and Admin/Email blocks (30 mins).  
       *Example tasks:* "Plan the day", "Focused work on the main project", "Handle administrative tasks."
     • **Exercise Template:** Include Preparation blocks (15–20 mins), Main Activity blocks (30–45 mins), and Recovery blocks (15–20 mins).  
       *Example tasks:* "Warm up and prepare", "Main workout session", "Cool down and recovery."
     • **General Productivity Template:** Include Morning Setup (30 mins), Focus blocks (60 mins), and Review blocks (30 mins).  
       *Example tasks:* "Set daily objectives", "Work on priority items", "Review progress."

2. Time Integrity & Scheduling Best Practices:
   - Ensure there are no overlapping blocks and that start/end times are rounded to 30‑minute intervals.
   - Block durations should align with the sum of their tasks’ durations.
   - Insert regular breaks (15–30 mins) after extended work periods and add transition buffers (5–15 mins) as needed.

3. Fallback Template Usage:
   - If the user does not provide any specifics, generate a balanced schedule using one of the above templates that best suits a generic day.
 
Return ONLY a JSON object with this structure:
{
  "scheduleRationale": "Response speaking directly to the user explaining how their request was handled, any conflicts, suggestions, and clarifications.",
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

  try {
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

    // Create a TransformStream to process and forward the streamed data
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === "[DONE]") continue;

            try {
              // Forward the data as an SSE message to the client
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
//   const { userInput, startTime, endTime } = await request.json();

//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     return new Response(
//       JSON.stringify({ message: "Missing Anthropic API key" }),
//       { status: 500 }
//     );
//   }

//   const createSchedulePrompt = `You are an expert scheduling assistant helping create a template schedule for a user who may have minimal saved data or vague requirements. Your goal is to create a well-structured day using evidence-based scheduling principles while keeping blocks and tasks generic enough to be easily customized.

// AVAILABLE DATA:
// Time Frame: ${startTime} to ${endTime}
// User Request: "${userInput}"

// SCHEDULE CREATION PRIORITIES:
// 1. Fixed Commitments:
//    - Place all events at their exact times; these cannot be moved.
//    - Use only the provided routine IDs from the routines array; if a routine does not exist, set routineId to null.
//    - Prioritize any tasks with urgent deadlines (e.g., due in the next 48 hours).
// 2. Context Analysis & Template Guidance:
//    - Analyze the user input to determine the intended schedule type (e.g., study, work, exercise, personal).
//    - If the user’s request is vague or minimal, choose one of the following template structures as a guide:
//      • Study Template: Incorporate Planning/Review blocks (30–45 mins), Deep Focus blocks (45–60 mins), and Active Learning blocks (45–60 mins).
//        Example tasks: "Review upcoming deadlines", "Deep focus on primary subject", "Practice active recall techniques".
//      • Work Template: Incorporate Planning blocks (30 mins), Deep Work blocks (60–90 mins), and Admin/Email blocks (30 mins).
//        Example tasks: "Plan the day", "Focused work on the main project", "Handle administrative tasks".
//      • Exercise Template: Incorporate Preparation blocks (15–20 mins), Main Activity blocks (30–45 mins), and Recovery blocks (15–20 mins).
//        Example tasks: "Warm up and prepare", "Main workout session", "Cool down and recovery".
//      • General Productivity Template: Incorporate Morning Setup (30 mins), Focus blocks (60 mins), and Review blocks (30 mins).
//        Example tasks: "Set daily objectives", "Work on priority items", "Review progress".
// 3. Time Integrity & Evidence-Based Scheduling:
//    - Ensure there are no overlapping blocks and that start/end times are rounded to 30-minute intervals.
//    - Block durations should align with the sum of their tasks’ durations.
//    - Insert regular breaks (15–30 mins) after long work periods and add transition buffers (5–15 mins) where needed.
// 4. ID Management:
//    - Use exact IDs from the input for events, routines, and projects.
//    - For any new or placeholder items, set the corresponding IDs to null.
//    - Validate all routineIds against the provided routineBlocks array.

// Return ONLY a JSON object with this structure:
// {
//   "scheduleRationale": "Response to user explaining how their requests were handled, any conflicts, and suggestions for improvement.",
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

//     // Create a TransformStream to process and forward the streamed data
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
//               // Forward the data as an SSE message to the client
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

// // import { NextRequest, NextResponse } from "next/server";

// // export const maxDuration = 60;

// // export async function POST(request: NextRequest) {
// //   const { userInput, startTime, endTime } = await request.json();

// //   const apiKey = process.env.ANTHROPIC_API_KEY;
// //   if (!apiKey) {
// //     return NextResponse.json(
// //       { message: "Missing Anthropic API key" },
// //       { status: 500 }
// //     );
// //   }

// //   const createSchedulePrompt = `You are an expert scheduling assistant creating an enhanced schedule preview for a first-time user who has provided specific scheduling requests. Your goal is to demonstrate how AI can optimize their schedule while honoring their specific preferences.

// // Time Frame: ${startTime} to ${endTime}
// // User Request: "${userInput}"

// // SCHEDULING PRINCIPLES:
// // 1. Request Analysis:
// // - Identify the primary schedule type requested (e.g., study, work, personal)
// // - Note any specific activities or preferences mentioned
// // - Determine the general purpose of the schedule
// // - Adapt block types and tasks to match the requested context

// // 2. Contextual Adaptation:
// // - Use appropriate block names for the schedule type
// // - Customize task types to match the context
// // - Adjust break patterns based on activity type
// // - Scale block durations to match typical needs
// // - Use relevant terminology in descriptions
// // - Maintain consistent theme throughout schedule

// // 3. AI Enhancement Strategy:
// // - Honor all specific time requests
// // - Suggest optimal placement for any floating tasks
// // - Add complementary blocks where appropriate
// // - Include strategic breaks between intense activities
// // - Group related tasks to minimize context switching

// // 4. Preview Enhancement:
// // - Add productivity insights to each block
// // - Explain energy level considerations
// // - Show how task grouping improves focus
// // - Demonstrate scheduling optimizations
// // - Include buffer time for transitions

// // 5. Educational Elements:
// // - Explain placement choices
// // - Highlight productivity principles
// // - Show energy management
// // - Demonstrate context switching reduction
// // - Point out flow optimization

// // Return ONLY a JSON object with this structure:
// // {
// //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
// //   "scheduleRationale": "Return exactly three insights separated by periods, in this order:

// //     1. Acknowledgment of the user's specific requests and how they've been incorporated into the schedule. Focus on showing that you understood and honored their key requirements.

// //     2. Clear explanation of how the schedule is organized and why tasks are placed where they are. Explain the logic behind the structure.

// //     3. Brief highlight of helpful optimizations or enhancements that complement their requests without overriding them. Focus on value-added features.",
// //   "userStartTime": "${startTime}",
// //   "userEndTime": "${endTime}",
// //   "blocks": [
// //     {
// //       "name": "Name from user request or complementary block name",
// //       "startTime": "HH:MM format",
// //       "endTime": "HH:MM format",
// //       "description": "Explanation combining user's intent with productivity insights. For user-specified blocks, acknowledge their choice and add relevant scientific context. For AI-suggested blocks, explain how they complement the user's requests.",
// //       "isEvent": boolean,
// //       "isRoutine": boolean,
// //       "isStandaloneBlock": boolean,
// //       "blockType": "user-specified" | "deep-work" | "planning" | "break" | "admin" | "collaboration",
// //       "energyLevel": "high" | "medium" | "low",
// //       "isUserRequested": boolean,
// //       "aiEnhancement": "Brief explanation of how AI has optimized this block or how it complements user's schedule",
// //       "tasks": [
// //         {
// //           "name": "Task name (from user request or complementary)",
// //           "description": "Task context and relevance",
// //           "duration": number (in minutes),
// //           "priority": "High" | "Medium" | "Low",
// //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
// //           "isUserSpecified": boolean,
// //           "aiInsight": "How this task fits into the overall schedule flow"
// //         }
// //       ]
// //     }
// //   ]
// // }

// // IMPORTANT GUIDELINES:
// // 1. Always honor user-specified times and tasks
// // 2. Maintain user's intended structure
// // 3. Add AI insights without overriding preferences
// // 4. Keep explanations concise but informative
// // 5. Focus on enhancement not replacement
// // 6. Make all suggestions complementary
// // 7. Use professional, confident language
// // 8. Ensure schedule remains achievable
// // 9. Add breaks only where they don't disrupt user requests
// // 10. Balance respecting user wishes with gentle optimization suggestions
// // 11. Consider task types independently from block types - while they often match, some tasks within a block may have different types based on their specific nature and requirements
// // 12. Ensure task type assignments reflect the actual work involved, not just the containing block's type
// // `;

// //   try {
// //     const schedule = await getAnthropicResponse(apiKey, createSchedulePrompt);

// //     return NextResponse.json(schedule);
// //   } catch (error) {
// //     console.error("An error occurred:", error);
// //     return NextResponse.json(
// //       { message: "Error creating schedule" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // async function getAnthropicResponse(apiKey: string, prompt: string) {
// //   const response = await fetch("https://api.anthropic.com/v1/messages", {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       "x-api-key": apiKey,
// //       "anthropic-version": "2023-06-01",
// //     },
// //     body: JSON.stringify({
// //       model: "claude-3-sonnet-20240229",
// //       max_tokens: 4096,
// //       temperature: 0.3,
// //       messages: [
// //         {
// //           role: "user",
// //           content: prompt,
// //         },
// //       ],
// //     }),
// //   });

// //   if (!response.ok) {
// //     const errorText = await response.text();
// //     console.error(`Anthropic API error: ${response.status}`, errorText);
// //     throw new Error(`Anthropic API error: ${errorText}`);
// //   }

// //   const data = await response.json();
// //   const content = data.content[0].text;

// //   try {
// //     return JSON.parse(content);
// //   } catch (parseError) {
// //     console.error("Error parsing JSON:", parseError);
// //     console.error("Received content:", content);
// //     throw new Error("Invalid JSON response from Anthropic API");
// //   }
// // }
