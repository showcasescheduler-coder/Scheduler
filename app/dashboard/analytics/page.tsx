"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/app/context/AppContext";
import { UserData } from "@/app/context/models";

// Define types for the AI response
interface Task {
  description: string;
  status: string;
}

interface TimeBlock {
  description: string;
  startTime: string;
  endTime: string;
  Tasks: Task[];
}

interface ScheduleResponse {
  mainGoal: string;
  ObjectiveOne: string;
  ObjectiveTwo: string;
  Blocks: TimeBlock[];
}

const AnalyticsPage = () => {
  const { projects, events, routines, tasks } = useAppContext();
  const [aiResponse, setAiResponse] = useState<ScheduleResponse | null>(null);

  const generateSchedule = async () => {
    const userInformation = {
      name: "John Doe", // You might want to get this from your user context
      projects: projects,
      stand_alone_tasks: tasks,
      routines: routines,
      events: events,
      // You might need to add historical_data if you have it in your app context
    };

    const rules = `
      My main goal should be a task that belongs to a project that has the highest priority
      My ObjectiveOne should be a task that belongs to from a project that has the highest priority or
      My ObjectiveTwo should be a task that belongs to a project that has the highest priority
      Please make sure tasks are grouped based on synergy and efficiency. For instance, smaller tasks could be grouped together in a single block to maximize productivity.
      Please take into consideration time tasks are likely to be the most effective. E.g Some tasks are better to be done in business hours
      Encourage the inclusion of stand-alone tasks, especially those with high priority or upcoming deadlines.
      break daily goals into smaller task where possible and appropriate based on its best judgment, but where it is unsure on how to break down any further then it shouldnt. 
      All scheduled tasks should belong to a time block with a descriptive name, start time, and end time.
      One or multiple tasks can be assigned to a block depending on time considerations.
      - Ensure that feedback from previous days (e.g., tasks that took longer than expected) is explicitly considered in the scheduling. This will help in adjusting the duration and order of tasks more effectively.
      - Also please prioritise tasks that were not completed yesterday as the user will likely want to carry on with that progress
      Consider task combinations, behavioral science, and travel time.
      Routines are time blocks with recurring tasks and should be added on their designated days but can be adjusted to meet the schedule.
      Tasks must be assigned to the main goal or objectives or as stand-alone tasks.
      8. Prioritize goals and tasks that were attempted and not completed the day before.
      9. Encourage combining multiple tasks into blocks for efficiency.
      10. Provide the schedule in the following format:
      {
          mainGoal: 
          ObjectiveOne:
          ObjectiveTwo:
          Blocks: [
              {
                  description:
                  startTime:
                  endTime:
                  Tasks:[
                      {
                          description: 
                          status:
                      }
                  ]
              }
          ]
      }
    `;

    const prompt = `Based on the following user information and rules, give me the most efficient schedule for tommorow using the user infromaton.  Return only the JSON object, with no additional text:\n\nUser Information: ${JSON.stringify(
      userInformation
    )}\n\nRules: ${rules}`;

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY in environment variables");
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedResponse: ScheduleResponse = JSON.parse(
        data.choices[0].message.content
      );
      setAiResponse(parsedResponse);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div>
      <Button size="sm" className="h-7 gap-1" onClick={generateSchedule}>
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Generate Schedule
        </span>
      </Button>
      {aiResponse && (
        <div>
          <h2>AI Generated Schedule:</h2>
          <p>Main Goal: {aiResponse.mainGoal}</p>
          <p>Objective One: {aiResponse.ObjectiveOne}</p>
          <p>Objective Two: {aiResponse.ObjectiveTwo}</p>
          <h3>Blocks:</h3>
          {aiResponse.Blocks.map((block, index) => (
            <div key={index}>
              <h4>{block.description}</h4>
              <p>
                {block.startTime} - {block.endTime}
              </p>
              <ul>
                {block.Tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>
                    {task.description} - {task.status}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
