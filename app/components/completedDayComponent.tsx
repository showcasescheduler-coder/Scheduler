import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  LayoutDashboard,
  ListTodo,
  Percent,
  RotateCcw,
  X,
} from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Task {
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

// Types shared between components
export interface Block {
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

interface PerformanceRating {
  level: string;
  score: number;
  comment: string;
}

// AllBlocksCompleted.tsx
interface AllBlocksCompletedProps {
  onCompleteDay: () => void;
  onAddNewBlock: () => void;
}

interface CompletedDayViewProps {
  completedBlocks: Block[];
  taskCompletionRate: number;
  blockCompletionRate: number;
  onReactivateDay: () => void;
}

const CompletedDayView: React.FC<CompletedDayViewProps> = ({
  completedBlocks,
  taskCompletionRate,
  blockCompletionRate,
  onReactivateDay,
}) => {
  const totalTasks = completedBlocks.reduce(
    (sum, block) => sum + block.tasks.length,
    0
  );
  const completedTasks = completedBlocks.reduce(
    (sum, block) => sum + block.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <Card className="min-h-[calc(100vh-4rem)] w-full">
      <CardContent className="h-full p-4 md:p-8 flex flex-col">
        {/* Header section remains the same */}
        <div className="flex-none mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-semibold">
                Day Complete
              </h1>
              <p className="text-sm text-gray-500">
                Summary of your completed tasks and blocks
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivateDay}
              className="gap-2 w-full md:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reactivate Day
            </Button>
          </div>
        </div>

        {/* Stats Cards section remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tasks completed today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Task Completion
              </CardTitle>
              <ListTodo className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(taskCompletionRate)}%
              </div>
              <Progress value={taskCompletionRate} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Blocks
              </CardTitle>
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBlocks.length}</div>
              <p className="text-xs text-muted-foreground">
                Blocks completed today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completed Blocks & Tasks */}
        <div className="flex-grow overflow-hidden flex flex-col min-h-0">
          <div className="flex-none mb-4">
            <h2 className="text-lg font-semibold">Completed Blocks & Tasks</h2>
            <p className="text-sm text-gray-500">
              Your accomplishments for the day
            </p>
          </div>

          <div className="overflow-y-auto flex-grow">
            <div className="space-y-4 pb-4">
              {completedBlocks.map((block) => (
                <Card
                  key={block._id}
                  className="border border-blue-100 bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {block.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {block.startTime} - {block.endTime}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600 flex-shrink-0">
                        {block.tasks.filter((t) => t.completed).length}/
                        {block.tasks.length} tasks
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 w-full">
                      {block.tasks.map((task) => (
                        <div
                          key={task._id}
                          className="relative flex items-center gap-2 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-50 transition-colors w-full"
                        >
                          <div
                            className={`flex-shrink-0 h-6 w-6 rounded-full ${
                              task.completed ? "bg-blue-100" : "bg-red-100"
                            } flex items-center justify-center`}
                          >
                            {task.completed ? (
                              <CheckCircle className="h-3 w-3 text-blue-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pr-16">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm font-medium text-gray-700 truncate block">
                                    {task.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{task.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <span className="absolute right-3 flex-shrink-0 px-2 py-1 rounded-full bg-white text-xs font-medium text-gray-600 border border-gray-100">
                            {task.duration}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedDayView;
