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
  console.log("here is all the data for the user");
  console.log(tasks);
  console.log(projects);
  console.log(eventBlocks);
  console.log(routineBlocks);

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
IMPORTANT: Only analyze the data in the provided arrays. DO NOT consider tasks or events mentioned in the User Request text.

Calculate Total Schedulable Minutes ONLY from array data:

1. Projects Duration = Sum of all projects[].tasks[].duration
   If projects array is empty, count as 0

2. Standalone Tasks Duration = Sum of all tasks[].duration
   If tasks array is empty, count as 0

3. Events Duration = For each event in eventBlocks array: 
   Convert endTime - startTime to minutes
   If eventBlocks array is empty, count as 0

4. Routines Duration = Sum of all routineBlocks[].tasks[].duration
   If routineBlocks array is empty, count as 0

5. Total Items Count = 
   Count ONLY items in arrays:
   projects[].tasks.length + 
   tasks.length + 
   eventBlocks.length + 
   Sum of all routineBlocks[].tasks.length

If ANY of the arrays are empty OR undefined, count their contribution as 0.

Return FALSE if:
- ALL arrays are empty, OR
- Total Items Count is less than 3, OR
- Total Schedulable Minutes / Total Available Minutes is less than 0.5 (50%)

Document your calculations in hasEnoughDataReason showing:
"Arrays contain: [X] projects, [Y] tasks, [Z] events, [W] routines. Total items: [N]. Total schedulable minutes: [M]. This [does/doesn't] meet minimum requirements because [explanation]"

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
  "hasEnoughDataReason": string,
  "intensity": "light" | "balanced" | "efficient"
}`;

  try {
    const analysis = await getAnthropicResponse(apiKey, analyzeRequestPrompt);

    return NextResponse.json({
      hasSpecificInstructions: analysis.hasSpecificInstructions,
      hasEnoughData: analysis.hasEnoughData,
      hasEnoughDataReason: analysis.hasEnoughDataReason,
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
