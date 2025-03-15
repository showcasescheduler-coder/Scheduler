import React from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Task } from "@/app/context/models";

interface BlockDurationIndicatorProps {
  startTime: string;
  endTime: string;
  tasks: Task[];
}

const BlockDurationIndicator: React.FC<BlockDurationIndicatorProps> = ({
  startTime,
  endTime,
  tasks,
}) => {
  // Calculate block duration in minutes
  const calculateBlockDuration = (start: string, end: string): number => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
  };

  // Calculate total task duration
  const calculateTasksDuration = (tasks: Task[]): number => {
    return tasks.reduce(
      (total, task) => total + (Number(task.duration) || 0),
      0
    );
  };

  const blockDuration = calculateBlockDuration(startTime, endTime);
  const tasksDuration = calculateTasksDuration(tasks);
  const remainingTime = blockDuration - tasksDuration;

  // If exactly 0 time left, don't show anything
  if (remainingTime === 0) {
    return null;
  }

  // Determine status based on remaining time
  let status: "available" | "low" | "overallocated";

  if (remainingTime > 0) {
    status = remainingTime < blockDuration * 0.2 ? "low" : "available";
  } else {
    status = "overallocated";
  }

  const remainingMinutes = Math.max(0, remainingTime);
  const excessMinutes = Math.max(0, -remainingTime);

  // Visual representation with clearer text
  const getStatusDisplay = () => {
    switch (status) {
      case "available":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: `${remainingMinutes} min available`,
          mobileText: `${remainingMinutes}m free`,
          color: "text-green-700 bg-green-50",
          tooltip: `This block has ${remainingMinutes} minutes available for additional tasks.`,
        };
      case "low":
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          text: `${remainingMinutes} min left`,
          mobileText: `${remainingMinutes}m left`,
          color: "text-yellow-700 bg-yellow-50",
          tooltip: `This block is almost full with only ${remainingMinutes} minutes left for additional tasks.`,
        };
      case "overallocated":
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: `${excessMinutes} min overallocated`,
          mobileText: `${excessMinutes}m over`,
          color: "text-red-700 bg-red-50",
          tooltip: `This block is overallocated by ${excessMinutes} minutes. Consider removing tasks or extending the block time.`,
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${display.color}`}
          >
            {display.icon}
            <span className="hidden sm:inline">{display.text}</span>
            <span className="sm:hidden">{display.mobileText}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{display.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockDurationIndicator;
