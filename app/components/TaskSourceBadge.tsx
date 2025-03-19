import React from "react";
import { FolderKanban, Repeat, Calendar, ListTodo } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Task } from "@/app/context/models"; // Adjust import path as needed

interface TaskSourceBadgeProps {
  task: Task;
}

const TaskSourceBadge: React.FC<TaskSourceBadgeProps> = ({ task }) => {
  // Project Task
  if (task.projectId || task.project) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="relative inline-flex items-center justify-center h-5 w-5">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-indigo-100 opacity-70"></span>
              <FolderKanban className="relative z-10 h-3 w-3 text-indigo-600" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-indigo-50 border-indigo-200">
            <div className="flex items-center space-x-1 text-indigo-700">
              <FolderKanban className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Project Task</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Routine Task
  if (task.routineId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="relative inline-flex items-center justify-center h-5 w-5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-100 opacity-80"></span>
              <Repeat className="relative z-10 h-3 w-3 text-emerald-600" />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-emerald-50 border-emerald-200"
          >
            <div className="flex items-center space-x-1 text-emerald-700">
              <Repeat className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Routine Task</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Event Task
  if (task.eventId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="relative inline-flex items-center justify-center h-5 w-5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-100 opacity-70"></span>
              <Calendar className="relative z-10 h-3 w-3 text-rose-600" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-rose-50 border-rose-200">
            <div className="flex items-center space-x-1 text-rose-700">
              <Calendar className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">Event Task</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Standalone Task (default)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="relative inline-flex items-center justify-center h-5 w-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sky-100 opacity-70"></span>
            <ListTodo className="relative z-10 h-3 w-3 text-sky-600" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-sky-50 border-sky-200">
          <div className="flex items-center space-x-1 text-sky-700">
            <ListTodo className="h-3.5 w-3.5" />
            <p className="text-xs font-medium">Standalone Task</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TaskSourceBadge;
