// app/api/getPerformanceRating/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { updatedDay } = await request.json();

  if (!updatedDay || !updatedDay.blocks || !Array.isArray(updatedDay.blocks)) {
    return NextResponse.json(
      { message: "Invalid day object" },
      { status: 400 }
    );
  }

  const currentTime = new Date().toISOString();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing OpenAI API key" },
      { status: 500 }
    );
  }

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
          {
            role: "system",
            content:
              "You are a precise and analytical productivity assistant. Your role is to evaluate user performance based on task completion, focusing primarily on completed tasks. Always respond with a valid JSON object.",
          },
          {
            role: "user",
            content: `
Evaluate the user's daily performance based on the following data:

Current time: ${currentTime}
Day schedule: ${JSON.stringify(updatedDay, null, 2)}

Analyze each completed task in the blocks, considering:
1. Task completion status (only count tasks marked as completed)
2. Task difficulty (estimate based on description and duration)
3. Task benefit (estimate based on description and potential impact)
4. Task priority

Provide a weighted score that factors in the difficulty, benefit, and priority of completed tasks only. Do not penalize for incomplete tasks, but rather focus on what has been accomplished.

Guidelines for scoring:
- The score should primarily reflect completed tasks
- Completed high-priority, high-difficulty, high-benefit tasks should significantly boost the score
- Consider the current time in relation to the schedule (e.g., completing morning tasks early in the day should be viewed positively)
- The overall score should be on a scale of 0 to 10, with decimals allowed for precision
- A score of 5 should represent completing about half of the day's important tasks, or a mix of less important tasks

Respond with a JSON object in this format:
{
  "level": "Getting Started" | "Making Progress" | "On Track" | "Excelling" | "Outstanding",
  "score": A number between 0 and 10,
  "comment": "A brief, constructive comment about the user's performance, focusing on completed tasks and offering encouragement"
}

Guidelines for levels:
- "Getting Started": 0-2 (Few tasks completed, regardless of their importance)
- "Making Progress": 2-4 (Some tasks completed, including a few important ones)
- "On Track": 4-6 (Good progress on important tasks)
- "Excelling": 6-8 (Most important tasks completed, along with some others)
- "Outstanding": 8-10 (All or nearly all important tasks completed, possibly ahead of schedule)

Ensure your response is a valid JSON object with no additional text or formatting.
              `,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get performance rating");
    }

    const data = await response.json();
    const ratingString = data.choices[0].message.content.trim();
    const rating = JSON.parse(ratingString);

    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error getting performance rating:", error);
    return NextResponse.json(
      { message: "Error getting performance rating" },
      { status: 500 }
    );
  }
}
