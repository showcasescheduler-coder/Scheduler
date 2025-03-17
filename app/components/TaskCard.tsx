import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GripVertical,
  MoreVertical,
  Edit,
  Clock,
  Trash2,
  Info,
} from "lucide-react";
import { Block, Task } from "@/app/context/models";
import TaskSourceBadge from "./TaskSourceBadge";

interface TaskCardProps {
  task: Task;
  block: Block;
  updatingTasks: boolean;
  updatingTaskId: string | null;
  onTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  onEditTask: (task: Task) => void;
  onRemoveTask: (task: Task, block: Block) => Promise<void>;
  onDeleteTask: (task: Task, block: Block) => Promise<void>;
  isTodayView: boolean; // Add this
  isReadOnly?: boolean; // Add this line
}

const SourceBadge = ({ task }: { task: Task }) => {
  if (task.projectId) {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
        Project
      </span>
    );
  }

  if (task.routineId) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        Routine
      </span>
    );
  }

  if (task.eventId) {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
        Event
      </span>
    );
  }

  // Changed the default return to show "Standalone" instead of "Task"
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
      Standalone
    </span>
  );
};

export function TaskCard({
  task,
  block,
  updatingTasks,
  updatingTaskId,
  onTaskCompletion,
  onEditTask,
  onRemoveTask,
  onDeleteTask,
  isTodayView,
  isReadOnly = false, // Add this line
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="mb-3 border-2 border-dashed border-blue-300 bg-blue-50/50 relative overflow-hidden shadow-sm"
      >
        <CardContent className="p-4 flex items-center justify-between text-gray-600">
          {/* Drag handle for consistent spacing */}
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-gray-300 cursor-move" />
            {/* Disabled checkbox for consistent layout */}
            <Checkbox checked={task.completed} disabled />
            {/* Task name */}
            <span className="font-medium italic">Moving: {task.name}</span>
          </div>
          <span className="text-xs text-gray-400 italic">Drop to reorder</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)] transition-shadow duration-200 ">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {!isReadOnly && (
              <div {...listeners}>
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
              </div>
            )}
            {isTodayView ? (
              // Today's view: active checkbox
              <Checkbox
                id={`task-${task._id}`}
                checked={task.completed}
                onCheckedChange={(checked) => {
                  if (checked === task.completed) return;
                  onTaskCompletion(task._id, Boolean(checked));
                }}
                className="flex-shrink-0 mt-0.5"
              />
            ) : (
              // Tomorrow's view: disabled checkbox
              <Checkbox
                id={`task-${task._id}`}
                checked={task.completed}
                disabled
                className="flex-shrink-0 mt-0.5 opacity-50 cursor-not-allowed"
              />
            )}

            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <label
                    htmlFor={`task-${task._id}`}
                    className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                  >
                    {task.name}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{task.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                    {task.duration}
                    <span className="hidden md:inline">min</span>
                  </span>

                  <TaskSourceBadge task={task} />
                </div>

                {!isReadOnly && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          onEditTask(task);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      {task.routineId ? null : (
                        <DropdownMenuItem
                          onClick={() => onRemoveTask(task, block)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Remove from Block
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => onDeleteTask(task, block)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        {/* <div
          className={`absolute top-0 right-0 bottom-0 w-1 ${
            task.priority === "High"
              ? "bg-red-500"
              : task.priority === "Medium"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          aria-label="Priority Indicator"
        /> */}
      </Card>
    </div>
  );
}
