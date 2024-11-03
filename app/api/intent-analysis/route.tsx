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

  const analyzeRequestPrompt = `You are a scheduling assistant analyzing user requests to determine how to handle schedule creation. Examine the following request carefully:

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

ANALYSIS INSTRUCTIONS:
Make three determinations:

1. Has Specific Instructions (hasSpecificInstructions):
TRUE only if:
- User specifies exactly which tasks need to be done at which times
- User gives concrete task assignments (not just "deep work" or "meetings" but "work on project X" or "team standup meeting")
- User provides specific content for time blocks (not just "focus time" but "write documentation for feature Y")
- User clearly defines what needs to be accomplished in each time period

FALSE if:
- User only provides general time block structure without specific task assignments
- User mentions generic categories of work without details ("meetings," "focus time," "deep work")
- User gives scheduling preferences without task specifics
- User delegates task assignment decisions to the system

2. Has Enough Data (hasEnoughData):
Calculate Total Schedulable Minutes:

1. Projects Duration = Sum of all projects[].tasks[].duration

2. Standalone Tasks Duration = Sum of all tasks[].duration

3. Events Duration = For each event: 
   Convert endTime - startTime to minutes
   (Example: "17:00" - "16:00" = 60 minutes)

4. Routines Duration = Sum of all routineBlocks[].tasks[].duration

5. Total Items Count = 
   projects[].tasks.length + 
   tasks.length + 
   eventBlocks.length + 
   Sum of all routineBlocks[].tasks.length

Total Schedulable Minutes = Projects Duration + Standalone Tasks Duration + Events Duration + Routines Duration

Return TRUE only if BOTH:
- (Total Schedulable Minutes / Total Available Minutes) >= 0.5 (50%)
- Total Items Count >= 3

Return FALSE otherwise.

Example:
From your data:
- Project task "Software Installation": 60 minutes
- Standalone task "Get cash out for mum": 5 minutes
- Event "meeting with tom": 60 minutes (17:00 - 16:00)
- Routine tasks: 10 minutes (5 + 5 for brush teeth and medication)

3. Schedule Intensity (intensity):
"light" if:
- User emphasizes breaks and downtime
- Requests a relaxed or flexible schedule
- Mentions wanting buffer time between tasks
- Expresses preference for a less demanding day
- Uses words like "relaxed," "easy," "flexible," "casual"

"balanced" if:
- User wants regular breaks between tasks
- Seeks moderate task density
- Requests typical workday pacing
- No strong preference indicated for intensity
- Uses words like "normal," "regular," "standard"

"efficient" if:
- User wants to maximize productivity
- Requests tight scheduling
- Emphasizes getting many tasks done
- Seeks to minimize gaps between tasks
- Uses words like "busy," "productive," "packed," "maximize"

Return ONLY a JSON object with this structure:
{
  "hasSpecificInstructions": boolean,
  "hasEnoughData": boolean,
  "intensity": "light" | "balanced" | "efficient"
}`;

  try {
    const analysis = await getAnthropicResponse(apiKey, analyzeRequestPrompt);

    return NextResponse.json({
      hasSpecificInstructions: analysis.hasSpecificInstructions,
      hasEnoughData: analysis.hasEnoughData,
      intensity: analysis.intensity,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Error analyzing schedule request" },
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
      max_tokens: 1024,
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
