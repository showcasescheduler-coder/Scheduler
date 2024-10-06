import { NextRequest, NextResponse } from "next/server";
// Add this line at the top of your file
export const maxDuration = 60; // Set to 300 seconds (5 minutes) or your desired limit

export async function POST(request: NextRequest) {
  const { userInformation, formattedCurrentTime, formattedCurrentDate } =
    await request.json();

  console.log("Received user information:", JSON.stringify(userInformation));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing OpenAI API key" },
      { status: 500 }
    );
  }

  const systemMessage = `You are an advanced AI scheduling assistant with expertise in behavioral science and productivity optimization. Your primary function is to create detailed, personalized daily schedules that maximize user productivity and well-being. You utilize current research in chronobiology, cognitive science, and productivity theory to craft schedules that align with users' natural rhythms and help them achieve their goals efficiently.`;

  const rules = `
1. Time Context Awareness:
   - The current date is ${formattedCurrentDate} and the current time is ${formattedCurrentTime}.
   - Plan for a full productive day starting at "09:00" and ending at "21:00".
   - Adapt the schedule to the time of day, considering circadian rhythms and typical energy levels.
   - CRUCIAL: Only schedule tasks and blocks AFTER ${formattedCurrentTime}.

2. Task and Description Analysis:
   - Carefully analyze the descriptions of all tasks and routines when creating the schedule.
   - Look for time-related keywords, context clues, or specific requirements in the descriptions to inform optimal scheduling times.
   - Use this information to make informed decisions about task placement and prioritization.

3. Optimized Block Structure and Time Usage:
   - Create 90-120 minute focused work sessions for daytime schedules.
   - Include breaks between work sessions (see rule 7 for details).
   - Aim to maximize productivity.
   - Ensure all available time between the start and end times is utilized effectively with a balance of tasks, breaks, and buffer time.

4. Task Prioritization and Timing:
   - Schedule the most important or challenging task in the first available block.
   - Align high-focus tasks with peak energy times (typically morning for most people).
   - Consider task urgency, importance, and deadlines, as well as any timing information from the task descriptions.

5. Task Grouping and Context Batching:
   - Group similar tasks together in dedicated blocks (e.g., admin tasks, creative work, communication).
   - Create themed blocks based on the nature of tasks (e.g., "Admin Block", "Creative Block", "Communication Block").
   - Aim to minimize context switching by keeping similar tasks consecutive where possible.

6. Routine and Event Integration:
   - Incorporate user's routines and events as fixed blocks in the schedule.
   - Ensure routine tasks are only scheduled within their designated routine blocks.
   - Allow buffer time before and after events for preparation and transition.
   - Pay special attention to any timing preferences or requirements mentioned in routine descriptions.

7. Meal and Break Handling:
   - Prioritize using existing user routines for breaks and meals at their designated times.
   - If no suitable routine exists:
     a. Schedule a lunch break around midday.
     b. Create 5-15 minute break blocks between work sessions as needed.
   - Distribute breaks throughout the day.
   - Mark all break blocks (routine or created) with 'isBreak: true'.

8. Flexibility and Buffer Time:
   - Include buffer time (10-15% of scheduled time) for unexpected issues or task overruns.

9. Balanced Productivity:
   - Aim for a mix of project work, stand-alone tasks, and personal activities.
   - Gradually transition to lighter tasks towards the end of the working day.

10. Schedule Rationale:
    - Provide a comprehensive, block-by-block breakdown of the entire schedule.
    - Use a friendly, conversational tone as if explaining the schedule directly to the user.
    - For each block, explain:
      a. The purpose and content of the block
      b. Why tasks are scheduled at specific times, referencing any relevant information from task descriptions
      c. How the block fits into the overall flow of the day
    - Explain any gaps or transitions between blocks
    - Discuss how the schedule optimizes productivity and well-being throughout the entire day
    - Highlight any specific accommodations made for user routines or events

11. Output Format:
    Provide the schedule as a JSON object with the following structure:
    {
      "currentTime": "${formattedCurrentTime}",
      "scheduleRationale": "Comprehensive string explaining the reasoning behind the schedule structure",
      "blocks": [
        {
          "name": string,
          "startTime": string,
          "endTime": string,
          "isEvent": boolean,
          "isRoutine": boolean,
          "isBreak": boolean,
          "eventId": string or null,
          "routineId": string or null,
          "tasks": [
            {
              "id": string,
              "name": string,
              "description": string,
              "status": string,
              "priority": string,
              "duration": number,
              "projectId": string or null,
              "isRoutineTask": boolean
            }
          ]
        }
      ]
    }

Note: Ensure all IDs are included, using existing IDs where available and generating new ones for new blocks. ALL times in the schedule MUST be after ${formattedCurrentTime} and before ${"21:00"}. For break blocks, the 'tasks' array should be empty unless it's a routine block with predefined tasks. Set isRoutineTask to true for tasks in routine blocks and false for all other tasks.`;

  const prompt = `${systemMessage}\n\nBased on the following user information and rules, create the most efficient schedule for tomorrow. Return only the JSON object, with no additional text:\n\nUser Information: ${JSON.stringify(
    userInformation
  )}\n\nRules: ${rules}`;

  console.log("Sending request to OpenAI API");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status}`, errorText);
      return NextResponse.json(
        { message: `OpenAI API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsedResponse = JSON.parse(data.choices[0].message.content);

    console.log("Successfully generated schedule");
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Error generating schedule" },
      { status: 500 }
    );
  }
}
