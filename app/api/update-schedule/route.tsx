import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { currentSchedule, changeRequest, siteName, modelName } = await request.json();
    const model = modelName || "claude-3-7-sonnet-20250219";

    // Create the prompt for Claude
    const prompt = `You are an expert cinema schedule optimizer. You have the following current schedule for ${siteName}:

CURRENT SCHEDULE:
${JSON.stringify(currentSchedule, null, 2)}

USER REQUEST FOR CHANGES:
${changeRequest}

Please update the schedule based on the user's request while maintaining optimization for revenue and following cinema best practices.

Important:
- Preserve the same JSON structure as the input
- Make only the changes requested by the user
- Ensure the schedule remains practical and optimized
- Update the reasoning to reflect the changes made
- Update revenue_projection and utilization_rate if the changes impact them

Return ONLY a valid JSON object with the updated schedule in the exact same format as provided.`;

    // Call Claude API
    console.log(`Updating schedule with model: ${model}`);
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 8000,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Extract the JSON from Claude's response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Try to find JSON in the response
    let updatedSchedule;
    try {
      // First try to parse the entire response as JSON
      updatedSchedule = JSON.parse(responseText);
    } catch {
      // If that fails, try to find JSON within the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        updatedSchedule = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse updated schedule from AI response");
      }
    }

    return NextResponse.json({ 
      success: true, 
      schedule: updatedSchedule 
    });

  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update schedule" 
      },
      { status: 500 }
    );
  }
}