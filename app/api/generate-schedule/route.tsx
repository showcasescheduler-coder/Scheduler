import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get form data
    const siteId = formData.get("siteId") as string;
    const siteName = formData.get("siteName") as string;
    const siteData = JSON.parse(formData.get("siteData") as string);
    const bestPractices = JSON.parse(formData.get("bestPractices") as string);
    const additionalInstructions = formData.get("additionalInstructions") as string;
    const modelName = formData.get("modelName") as string || "claude-3-7-sonnet-20250219";
    
    // Parse Excel files
    let lastWeekData = null;
    let newFilmsData = null;
    
    const lastWeekFile = formData.get("lastWeekFile") as File | null;
    if (lastWeekFile) {
      const buffer = await lastWeekFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      lastWeekData = XLSX.utils.sheet_to_json(worksheet);
    }
    
    const newFilmsFile = formData.get("newFilmsFile") as File | null;
    if (newFilmsFile) {
      const buffer = await newFilmsFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      newFilmsData = XLSX.utils.sheet_to_json(worksheet);
    }

    // Log input data for debugging
    console.log("=== SCHEDULE GENERATION INPUT DATA ===");
    console.log("Site Name:", siteName);
    console.log("Site ID:", siteId);
    console.log("AI Model Selected:", modelName);
    console.log("Site Data:", JSON.stringify(siteData, null, 2));
    console.log("Additional Instructions:", additionalInstructions || "None");
    console.log("Last Week Data Rows:", lastWeekData ? lastWeekData.length : 0);
    if (lastWeekData && lastWeekData.length > 0) {
      console.log("Last Week Sample:", JSON.stringify(lastWeekData[0], null, 2));
    }
    console.log("New Films Data Rows:", newFilmsData ? newFilmsData.length : 0);
    if (newFilmsData && newFilmsData.length > 0) {
      console.log("New Films Sample:", JSON.stringify(newFilmsData[0], null, 2));
    }
    console.log("Best Practices Sections:", bestPractices.length);
    console.log("=====================================");

    // Format best practices for the prompt
    const formattedBestPractices = bestPractices.map((section: any) => {
      return `${section.title || section.name}:\n${section.items.map((item: any) => `- ${item.title || item.name}: ${item.description}`).join('\n')}`;
    }).join('\n\n');

    // Create the prompt for Claude
    const prompt = `You are an expert cinema schedule optimizer. Generate an optimal weekly schedule for ${siteName}.

YOUR TASK:
Create a schedule that maximizes revenue by intelligently balancing films from last week (holdovers) with new releases. Analyze last week's performance to decide which films to keep, which to reduce/move, and which to replace with new releases.

SITE INFORMATION (includes screens, operating hours, amenities, address, and all site details):
${JSON.stringify(siteData, null, 2)}

${siteData.customPrompt ? `SITE-SPECIFIC CUSTOM INSTRUCTIONS (These are specific requirements for this cinema - MUST follow these):
${siteData.customPrompt}

` : ''}BEST PRACTICES TO FOLLOW (Apply these scheduling guidelines):
${formattedBestPractices}

${lastWeekData ? `LAST WEEK'S PERFORMANCE DATA (Current films - evaluate which to keep/reduce/remove):
${JSON.stringify(lastWeekData, null, 2)}

` : ''}${newFilmsData ? `NEW FILM RELEASES (New films available to schedule):
${JSON.stringify(newFilmsData, null, 2)}

` : ''}${additionalInstructions ? `ADDITIONAL INSTRUCTIONS FROM USER (Priority instructions for this specific schedule):
${additionalInstructions}

` : ''}CRITICAL OBJECTIVE: Maximize total revenue by utilizing ALL cinema resources effectively.

REQUIREMENTS - Your schedule MUST:
- Use ALL ${siteData.screens?.length || 5} screens available at the cinema - no screen should be left unused
- Follow ALL site-specific custom instructions provided above (if any)
- Apply ALL best practices guidelines listed above
- Respect the operating hours: ${siteData.operatingHours ? JSON.stringify(siteData.operatingHours) : 'standard hours'}
- Balance films from last week (holdovers) with new releases based on their performance data
- Analyze EVERY field, metric, and detail in all data sections above - nothing should be ignored
- Evaluate each film from last week using ALL performance metrics (revenue, attendance, occupancy %, screen type, day-by-day patterns, and any other data provided)
- Integrate new releases considering ALL their attributes (projections, studio notes, market commentary, distributor priorities, format requirements, target demographics, runtime, rating, and any other information provided)
- Utilize the complete site information (all screens with their specific capacities and features, amenities, location specifics)
- Strictly follow any additional instructions from the user
- Make data-driven decisions using every piece of information available
- Maximize overall revenue potential by fully utilizing all cinema capacity

IMPORTANT: Return ONLY the JSON schedule, no explanations or questions. Generate the complete schedule immediately as a single valid JSON object with the following structure:
{
  "site": "${siteName}",
  "weekRange": "Start Date - End Date",
  "screens": [
    {
      "name": "Screen Name",
      "capacity": 200,
      "features": ["IMAX", "Dolby Atmos"],
      "schedule": {
        "monday": [
          {
            "film": "Film Title",
            "times": ["10:00", "13:00", "16:00"],
            "rating": "PG-13",
            "runtime": "120 min"
          }
        ],
        "tuesday": [...],
        "wednesday": [...],
        "thursday": [...],
        "friday": [...],
        "saturday": [...],
        "sunday": [...]
      }
    }
  ],
  "reasoning": "Brief explanation of optimization strategy",
  "warnings": ["Any considerations or warnings"],
  "revenue_projection": "$XXX,XXX - $XXX,XXX",
  "utilization_rate": "XX%"
}`;

    // Call Claude API
    console.log(`Calling Claude API with model: ${modelName}`);
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: modelName,
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
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log("=== AI RESPONSE ===");
    console.log("Model Used:", modelName);
    console.log("Response Time:", `${responseTime.toFixed(2)} seconds`);
    console.log("Response length:", responseText.length);
    console.log("Full AI Response:");
    console.log(responseText);
    console.log("===================");
    
    // Try to find JSON in the response
    let scheduleData;
    try {
      // First try to parse the entire response as JSON
      scheduleData = JSON.parse(responseText);
    } catch {
      // If that fails, try to find JSON within the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Could not find JSON in response:", responseText);
        throw new Error("Could not parse schedule from AI response");
      }
    }

    console.log("=== PARSED SCHEDULE DATA ===");
    console.log(JSON.stringify(scheduleData, null, 2));
    console.log("============================");
    
    return NextResponse.json({ 
      success: true, 
      schedule: scheduleData 
    });

  } catch (error) {
    console.error("Error generating schedule:", error);
    // More detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Failed to generate schedule";
    const errorDetails = {
      success: false,
      error: errorMessage,
      // Include more context in development/logs
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
        details: error
      })
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}