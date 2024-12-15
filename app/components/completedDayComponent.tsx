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
    <Card className="h-[calc(100vh-4rem)]">
      <CardContent className="h-full p-8 flex flex-col">
        {/* Header */}
        <div className="flex-none mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Day Complete</h1>
              <p className="text-sm text-gray-500">
                Summary of your completed tasks and blocks
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivateDay}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reactivate Day
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8 flex-none">
          <Card>
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

          <Card>
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

          <Card>
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

        {/* Blocks and Tasks */}
        <Card className="flex-grow flex flex-col min-h-0">
          <CardHeader className="flex-none">
            <CardTitle>Completed Blocks & Tasks</CardTitle>
            <CardDescription>Your accomplishments for the day</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-grow">
            <div className="space-y-6">
              {completedBlocks.map((block) => (
                <Card key={block._id} className="border border-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {block.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {block.startTime} - {block.endTime}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {block.tasks.filter((t) => t.completed).length}/
                        {block.tasks.length} tasks
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-2">
                      {block.tasks.map((task) => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-6 w-6 rounded-full ${
                                task.completed ? "bg-blue-100" : "bg-red-100"
                              } flex items-center justify-center`}
                            >
                              {task.completed ? (
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                              ) : (
                                <X className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {task.name}
                            </span>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-white text-xs font-medium text-gray-600 border border-gray-100">
                            {task.duration}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CompletedDayView;
