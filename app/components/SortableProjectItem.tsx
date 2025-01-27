"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"; // For transforming styles
import { GripVertical, Calendar, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  Event,
  Project,
  ProjectTask,
  Task,
  Routine,
  RoutineTask,
  UserData,
  Day,
  Block,
  PreviewSchedule, // Impo
} from "@/app/context/models";

// // In your AppContext.ts or models.ts file
// export type Priority = "High" | "Medium" | "Low";

// export interface Project {
//   completed: boolean;
//   _id: string;
//   name: string;
//   description: string;
//   deadline: Date;
//   time: string;
//   priority: Priority; // Change from string to Priority
//   tasks?: {
//     completed: boolean;
//   }[];
//   order: number;
// }

// This is your single project item for the Active list
interface SortableProjectItemProps {
  project: Project;
  index: number;
  onViewDetails: (id: string) => void;
  isOverlay?: boolean;
}

export default function SortableProjectItem({
  project,
  index,
  onViewDetails,
  isOverlay,
}: SortableProjectItemProps) {
  // DnDKit "useSortable" hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project._id,
    disabled: isOverlay,
  });

  // For smooth dragging transform

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
    opacity: isDragging ? 0.5 : 1,
    position: isOverlay ? "relative" : "static",
    zIndex: isOverlay ? 999 : "auto",
    pointerEvents: isOverlay
      ? "none"
      : ("auto" as React.CSSProperties["pointerEvents"]),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-3"
      // any props you need
    >
      <div className="flex items-center gap-4 p-6">
        {/* Left section with drag handle and number */}
        <div className="flex w-24 items-center gap-3">
          {/*
            We only pass listeners/attributes into the handle
            so dragging initiates ONLY on the GripVertical icon.
          */}
          <span
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            #{index + 1}
          </span>
        </div>

        {/* Project title and info section */}
        <div className="flex items-center gap-4 w-full">
          {/* Left: Project title & info */}
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {project.deadline
                    ? format(new Date(project.deadline), "MMM d, yyyy")
                    : "No deadline"}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span>
                {project.tasks
                  ? `${project.tasks.filter((task) => task.completed).length}/${
                      project.tasks.length
                    } tasks`
                  : "0/0 tasks"}
              </span>
            </div>
          </div>

          {/* Center: example progress bar */}
          <div className="hidden sm:block mx-auto w-80">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-gray-700">
                {project.tasks && project.tasks.length > 0
                  ? Math.round(
                      (project.tasks.filter((task) => task.completed).length /
                        project.tasks.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${
                    project.tasks && project.tasks.length > 0
                      ? Math.round(
                          (project.tasks.filter((task) => task.completed)
                            .length /
                            project.tasks.length) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Right: Priority badge and actions */}
          <div className="flex items-center gap-2">
            <div
              className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", {
                "bg-red-100 text-red-800": project.priority === "High",
                "bg-yellow-100 text-yellow-800": project.priority === "Medium",
                "bg-green-100 text-green-800": project.priority === "Low",
              })}
            >
              {project.priority}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900"
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Project Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  align="center"
                  className="max-w-xs p-3"
                >
                  <p className="text-sm">
                    {project.description || "No description provided"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => onViewDetails(project._id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
