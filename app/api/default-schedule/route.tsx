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

  const createSchedulePrompt = `You are an expert scheduling assistant helping create a template schedule for a user who may have minimal saved data. Your goal is to create a well-structured day using evidence-based scheduling principles while keeping blocks and tasks generic enough to be easily customized.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"
Events (Must be honored): ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Tasks: ${JSON.stringify(tasks, null, 2)}
Projects: ${JSON.stringify(projects, null, 2)}

SCHEDULE CREATION PRIORITIES:
1. Fixed Commitments (Highest Priority):
   - Place all events for today's date first - these cannot be moved
   - Identify and prioritize any tasks with due dates in the next 48 hours
   - Honor any existing routines the user has created

2. Context Analysis:
   - Determine schedule type from user input (study, work, exercise, personal, etc.)
   - Keep block names generic but contextually appropriate (e.g., "Morning Deep Work Block" not "Mathematics Study Block")
   - Use time blocks appropriate for the schedule type
   - Create placeholder tasks that guide without being overly specific

3. Template Block Structures:
   Study Template:
   - Planning/Review blocks (30-45 mins)
   - Deep Focus blocks (45-60 mins)
   - Active Learning blocks (45-60 mins)
   - Example tasks: "Review upcoming deadlines", "Deep focus work on primary subject", "Practice active recall techniques"

   Work Template:
   - Planning blocks (30 mins)
   - Deep Work blocks (60-90 mins)
   - Admin/Email blocks (30 mins)
   - Example tasks: "Process inbox and plan day", "Focused work on main project", "Handle administrative tasks"

   Exercise Template:
   - Preparation blocks (15-20 mins)
   - Main Activity blocks (30-45 mins)
   - Recovery blocks (15-20 mins)
   - Example tasks: "Prepare equipment and warm up", "Complete main workout", "Cool down and recovery"

   General Productivity Template:
   - Morning Setup (30 mins)
   - Focus blocks (60 mins)
   - Review blocks (30 mins)
   - Example tasks: "Plan daily objectives", "Work on priority items", "Review progress and adjust plan"

4. Evidence-Based Block Structure:
   - Align with natural energy cycles (high energy for deep work)
   - Include regular breaks (15-30 mins) between major blocks
   - Add transition buffers (5-15 mins)
   - Group similar activities
   - Alternate intensity levels

5. Task Creation Guidelines:
   - Create generic but actionable placeholder tasks
   - Use format: "[Action Word] + [Generic Subject/Activity]"
   - Include clear "[Add specific detail here]" placeholders
   - Make tasks demonstrate the intended use of each block
   - Keep tasks flexible enough for easy customization

RESPONSE FORMAT:
Return ONLY a JSON object with this structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Explain how the template provides structure while remaining customizable",
  "userStartTime": "${startTime}",
  "userEndTime": "${endTime}",
  "blocks": [
    {
      "name": "Generic but context-appropriate name (e.g., 'Morning Deep Work Block')",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "description": "Block purpose and evidence-based placement rationale",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": string | null,
      "routineId": string | null,
      "blockType": "deep-work" | "planning" | "break" | "admin" | "collaboration",
      "energyLevel": "high" | "medium" | "low",
      "tasks": [
        {
          "id": "existing-id-if-found or null",
          "name": "Generic but actionable task name",
          "description": "Clear purpose with customization guidance",
          "duration": number,
          "priority": "High" | "Medium" | "Low",
          "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
          "isRoutineTask": boolean
        }
      ]
    }
  ]
}

ADDITIONAL GUIDELINES:
1. Prioritize existing events and urgent tasks
2. Keep all block names and tasks generic but purposeful
3. Create realistic template schedules
4. Include proper transitions and breaks
5. Consider energy management
6. Make blocks and tasks customizable
7. Ensure logical flow
8. Include buffer time
9. Balance focus and renewal
10. Create tasks that guide without restricting`;

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
