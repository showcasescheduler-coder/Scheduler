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

  const createSchedulePrompt = `You are an expert scheduling assistant creating an impressive preview schedule for a first-time user. They've made a general request without specific details. Your goal is to create an educational and inspiring schedule that demonstrates the power of AI-driven scheduling.

Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

SCHEDULING PRINCIPLES:
1. Peak Performance Blocks:
- Place high-focus work during morning hours (typically 9:00-12:00)
- Schedule creative tasks during energy peaks
- Add administrative tasks during natural energy dips
- Include strategic breaks to maintain productivity

2. Block Structure:
- Start with a morning planning block
- Include 2-3 deep work sessions
- Add collaborative/meeting blocks
- Schedule lighter tasks for late afternoon
- End with a day wrap-up block

3. Educational Elements:
- Each block should teach best practices
- Include clear rationale for time choices
- Demonstrate energy management
- Show task grouping principles

4. Example Tasks:
- Use relatable, generic tasks that most professionals encounter
- Mix different types of work (focused, collaborative, administrative)
- Include both strategic and tactical activities
- Show how breaks and buffers improve productivity

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "A compelling explanation of the schedule's structure, highlighting the behavioral science and productivity principles used. Focus on how this optimizes energy, minimizes context switching, and maintains sustainable productivity.",
  "userStartTime": "${startTime}",
  "userEndTime": "${endTime}",
  "blocks": [
    {
      "name": "Clear, action-oriented block name",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "description": "Educational explanation of why this block is placed here. Include energy level considerations and productivity science.",
      "isEvent": false,
      "isRoutine": false,
      "isStandaloneBlock": true,
      "blockType": "deep-work" | "planning" | "break" | "admin" | "collaboration",
      "energyLevel": "high" | "medium" | "low",
      "tasks": [
        {
          "name": "Example task name",
          "description": "Brief explanation of this type of task",
          "duration": number (in minutes),
          "priority": "High" | "Medium" | "Low",
          "isRoutineTask": false
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
1. Create 6-8 blocks total
2. Each block should be 30-90 minutes
3. Include 2-3 example tasks per block
4. Space out high-energy tasks
5. Add breaks between intense blocks
6. Make all explanations educational but concise
7. Focus on demonstrating schedule optimization
8. Use clear, professional language
9. Make block transitions logical
10. Ensure schedule feels balanced and achievable`;

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
