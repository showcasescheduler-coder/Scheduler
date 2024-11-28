import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userInput } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  const analyzeRequestPrompt = `You are analyzing a first-time user's scheduling request to determine whether to show them a specific or generalized schedule preview. Examine their request:

User's Request: "${userInput}"

ANALYSIS CRITERIA:

Is this a specific scheduling request? 

TRUE if the user:
- Describes particular tasks or activities they want to do
- Mentions specific times or time preferences
- Gives clear structure for how they want their day organized
- Names concrete activities (e.g., "morning meeting", "gym at 3pm", "work on project X")

FALSE if the user:
- Makes a general request for a schedule or routine
- Asks for productivity suggestions
- Uses vague terms like "good schedule" or "productive day"
- Doesn't specify particular activities or times
- Seeks guidance or recommendations

Return ONLY a JSON object with this structure:
{
  "isSpecificRequest": boolean,
  "reasoning": "Brief explanation of why this determination was made, useful for customizing the preview message"
}`;

  try {
    const analysis = await getAnthropicResponse(apiKey, analyzeRequestPrompt);

    return NextResponse.json({
      isSpecificRequest: analysis.isSpecificRequest,
      reasoning: analysis.reasoning,
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
