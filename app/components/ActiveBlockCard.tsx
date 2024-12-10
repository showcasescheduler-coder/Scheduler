import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Info,
  MoreVertical,
  GripVertical,
  Edit,
  Trash2,
  Check,
  Plus,
  LinkIcon,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Task {
  _id: string;
  blockId: string;
  dayId: string;
  name: string;
  description: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "in_progress" | "completed";
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  isRoutineTask: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
interface Block {
  _id: string;
  dayId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "pending" | "complete" | "incomplete";
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  event: string | null;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isStandaloneBlock?: boolean;
  meetingLink: string;
}

interface ActiveBlockCardProps {
  block: Block;
  onEditBlock: (block: Block) => void;
  onDeleteBlock: (block: Block) => void;
  onTaskCompletion: (taskId: string, completed: boolean) => void;
  onEditTask: (task: Task) => void;
  onRemoveTask: (task: Task, block: Block) => void;
  onDeleteTask: (task: Task, block: Block) => void;
  onAddTask: (blockId: string) => void;
  onCompleteBlock: (blockId: string) => void;
  updatingTasks?: boolean;
  updatingTaskId?: string | null;
}

export default function ActiveBlockCard({
  block,
  onEditBlock,
  onDeleteBlock,
  onTaskCompletion,
  onEditTask,
  onRemoveTask,
  onDeleteTask,
  onAddTask,
  onCompleteBlock,
  updatingTasks = false,
  updatingTaskId = null,
}: ActiveBlockCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isEditBlockDialogOpen, setIsEditBlockDialogOpen] =
    React.useState(false);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <div className="flex items-center gap-2">
            {block.name}
            {block.isStandaloneBlock && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Optimized
              </span>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{block.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {block.startTime} - {block.endTime}
          </div>
          <Dialog
            open={isEditBlockDialogOpen}
            onOpenChange={setIsEditBlockDialogOpen}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      onEditBlock(block);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Block</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => onDeleteBlock(block)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Block</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {block.tasks.map((task) => (
          <Card
            key={task._id}
            className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                <Checkbox
                  id={`task-${task._id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    onTaskCompletion(task._id, checked as boolean)
                  }
                  className="flex-shrink-0 mt-0.5"
                  disabled={updatingTasks && updatingTaskId === task._id}
                />

                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <label
                        htmlFor={`task-${task._id}`}
                        className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                      >
                        {task.name}
                      </label>

                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                        {task.duration}
                        <span className="hidden md:inline">min</span>
                      </span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="md:hidden h-2.5 w-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                            <span className="hidden md:inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
                              {task.type}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{task.type}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                onEditTask(task);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Task
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem
                            onClick={() => onRemoveTask(task, block)}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Remove from Block
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteTask(task, block)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
            <div
              className={`absolute top-0 right-0 bottom-0 w-1 ${
                task.priority === "High"
                  ? "bg-red-500"
                  : task.priority === "Medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              aria-label="Priority Indicator"
            />
          </Card>
        ))}

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            onClick={() => onAddTask(block._id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={() => onCompleteBlock(block._id)}
            >
              <Check className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Complete</span>
            </Button>
            {block.meetingLink ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                asChild
              >
                <a
                  href={block.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <LinkIcon className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Join Meeting</span>
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Clock className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Start</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
