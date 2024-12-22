import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userInput, startTime, endTime } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  const createSchedulePrompt = `You are an expert scheduling assistant. A new user has just arrived on the homepage and given a general request, but they have not provided specific details. Your goal is to produce a schedule that not only reflects their general input but also highlights the app’s ability to create balanced, appealing schedules. This schedule should be crafted in such a way that the user sees the value of the tool and feels encouraged to sign up.

You are an expert scheduling assistant creating a schedule that matches the user's requested context, even if they haven't provided many details. Your primary goal is to create a schedule that reflects their intended activities while incorporating productivity best practices.

Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

CONTEXT ADAPTATION:
1. Schedule Type Identification:
- Carefully analyze user's request to determine schedule type (study, work, exercise, personal, etc.)
- Adapt all terminology to match the identified context (e.g., "Study Session" instead of "Deep Work" for study schedules)
- Ensure all blocks and tasks align with the identified schedule type
- Use appropriate activity durations for the context (e.g., 45-min study blocks, 60-min work blocks)
a
2. Activity-Specific Structure:
For Study Schedules:
- Use 45-60 minute focused study sessions
- Include concept review and practice time
- Add short breaks between subjects
- Incorporate active recall and review periods

For Work Schedules:
- Schedule deep work during peak hours
- Include collaboration and meeting times
- Add administrative task blocks
- Plan for project work and reviews

For Exercise Schedules:
- Alternate between different exercise types
- Include proper warm-up periods
- Add cool-down and recovery time
- Consider intensity levels

3. Context-Appropriate Breaks:
- Adjust break frequency based on activity type
- Scale break duration to match activity intensity
- Include activity-appropriate break tasks
- Position breaks to maximize effectiveness

4. Block Structure Guidelines:
- Name blocks using context-appropriate terminology
- Include context-specific productivity techniques
- Add relevant task types for the schedule context
- Use appropriate energy management strategies

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Explanation focusing on why this schedule structure is optimal for the requested activity type, referencing relevant research and best practices for this specific context.",
  "userStartTime": "${startTime}",
  "userEndTime": "${endTime}",
  "blocks": [
    {
      "name": "Context-appropriate block name",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "description": "Explanation of this block's purpose within the specific context requested",
      "isEvent": false,
      "isRoutine": false,
      "isStandaloneBlock": true,
      "blockType": "deep-work" | "planning" | "break" | "admin" | "collaboration",
      "energyLevel": "high" | "medium" | "low",
      "tasks": [
        {
          "name": "Context-appropriate task name",
          "description": "Task explanation relevant to the schedule type",
          "duration": number,
          "priority": "High" | "Medium" | "Low",
          "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
          "isRoutineTask": false
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
1. Stay strictly within the requested context
2. Use terminology specific to the identified schedule type
3. Match block durations to activity best practices
4. Include context-appropriate breaks
5. Use activity-specific productivity techniques
6. Maintain proper intensity progression
7. Include relevant cool-down/wrap-up activities
8. Ensure proper sequencing for the activity type
9. Add context-specific buffer times
10. Scale complexity to activity requirements
11. Consider energy management for the specific activity
12. Include activity-appropriate transitions

Remember: Every aspect of the schedule should clearly reflect the user's requested context, from block names to task descriptions.`;

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
