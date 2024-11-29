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

  const createSchedulePrompt = `You are an expert scheduling assistant creating an enhanced schedule preview for a first-time user who has provided specific scheduling requests. Your goal is to demonstrate how AI can optimize their schedule while honoring their specific preferences.

Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

SCHEDULING PRINCIPLES:
1. Request Analysis:
- Identify specific tasks and times mentioned
- Note any preferences or constraints
- Recognize task relationships
- Understand timing requirements

2. AI Enhancement Strategy:
- Honor all specific time requests
- Suggest optimal placement for any floating tasks
- Add complementary blocks where appropriate
- Include strategic breaks between intense activities
- Group related tasks to minimize context switching

3. Preview Enhancement:
- Add productivity insights to each block
- Explain energy level considerations
- Show how task grouping improves focus
- Demonstrate scheduling optimizations
- Include buffer time for transitions

4. Educational Elements:
- Explain placement choices
- Highlight productivity principles
- Show energy management
- Demonstrate context switching reduction
- Point out flow optimization

Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Detailed explanation of how the schedule honors their specific requests while optimizing for productivity. Highlight specific enhancements and explain the science behind the optimizations.",
  "userStartTime": "${startTime}",
  "userEndTime": "${endTime}",
  "blocks": [
    {
      "name": "Name from user request or complementary block name",
      "startTime": "HH:MM format",
      "endTime": "HH:MM format",
      "description": "Explanation combining user's intent with productivity insights. For user-specified blocks, acknowledge their choice and add relevant scientific context. For AI-suggested blocks, explain how they complement the user's requests.",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "blockType": "user-specified" | "deep-work" | "planning" | "break" | "admin" | "collaboration",
      "energyLevel": "high" | "medium" | "low",
      "isUserRequested": boolean,
      "aiEnhancement": "Brief explanation of how AI has optimized this block or how it complements user's schedule",
      "tasks": [
        {
          "name": "Task name (from user request or complementary)",
          "description": "Task context and relevance",
          "duration": number (in minutes),
          "priority": "High" | "Medium" | "Low",
          "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
          "isUserSpecified": boolean,
          "aiInsight": "How this task fits into the overall schedule flow"
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
1. Always honor user-specified times and tasks
2. Maintain user's intended structure
3. Add AI insights without overriding preferences
4. Keep explanations concise but informative
5. Focus on enhancement not replacement
6. Make all suggestions complementary
7. Use professional, confident language
8. Ensure schedule remains achievable
9. Add breaks only where they don't disrupt user requests
10. Balance respecting user wishes with gentle optimization suggestions
11. Consider task types independently from block types - while they often match, some tasks within a block may have different types based on their specific nature and requirements
12. Ensure task type assignments reflect the actual work involved, not just the containing block's type
`;

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
