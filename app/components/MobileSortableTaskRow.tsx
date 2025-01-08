"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  duration: number;
  deadline: string;
  completed: boolean;
  projectId: string;
  status?: string;
  type?: "deep-work" | "planning" | "break" | "admin" | "collaboration";
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  deadline: string;
  priority: string;
  completed: boolean;
  tasks: Task[];
}

interface MobileSortableTaskRowProps {
  task: Task;
  index: number;
  project: Project;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string, projectId: string) => void;
  onEdit: (task: Task) => void;
}

export const MobileSortableTaskRow: React.FC<MobileSortableTaskRowProps> = ({
  task,
  index,
  project,
  onComplete,
  onDelete,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          className="flex items-center gap-2 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{index + 1}</span>
        </div>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked: boolean | string) =>
            onComplete(task._id, checked === true)
          }
          disabled={project.completed}
          className="ml-2"
        />
      </TableCell>
      <TableCell className="py-3">
        <div className="space-y-1">
          <div className="font-medium">{task.name}</div>
          {task.description && (
            <div className="text-sm text-gray-500 truncate max-w-[280px]">
              {task.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={project.completed}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onEdit(task);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Task</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(task._id, project._id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Task</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default MobileSortableTaskRow;
