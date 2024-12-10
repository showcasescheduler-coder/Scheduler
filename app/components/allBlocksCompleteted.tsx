import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Target,
  BarChart2,
  ListTodo,
  ChevronUp,
  ChevronRight,
  X,
  Percent,
  LayoutDashboard,
} from "lucide-react";
import React, { useState } from "react";

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

interface AllBlocksCompletedProps {
  onCompleteDay: () => void;
  onAddNewBlock: () => void;
  blocks?: Block[];
  taskCompletionRate?: number;
  blockCompletionRate?: number;
}

const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
  onCompleteDay,
  onAddNewBlock,
  blocks = [],
  taskCompletionRate = 100,
  blockCompletionRate = 100,
}) => {
  const completedTasks = blocks.reduce(
    (sum, block) => sum + block.tasks.filter((t) => t.completed).length,
    0
  );
  const totalTasks = blocks.reduce((sum, block) => sum + block.tasks.length, 0);

  return (
    <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white">
      <CardContent className="flex flex-col h-full p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  All Blocks Completed
                </h2>
                <p className="text-sm text-gray-500">
                  You've completed all your time blocks. What would you like to
                  do next?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Tasks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress
              value={(completedTasks / totalTasks) * 100}
              className="h-1 bg-blue-100 [&>div]:bg-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Blocks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {blocks.length}
              </span>
            </div>
            <Progress
              value={100}
              className="h-1 bg-blue-100 [&>div]:bg-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Completion
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
            <Progress
              value={(completedTasks / totalTasks) * 100}
              className="h-1 bg-blue-100 [&>div]:bg-blue-600"
            />
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-6">
            {blocks.map((block) => (
              <div key={block._id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {block.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {block.startTime} - {block.endTime}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {block.tasks.filter((t) => t.completed).length}/
                    {block.tasks.length} tasks
                  </span>
                </div>

                <div className="pl-6 space-y-2">
                  {block.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {task.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-600">
                          {task.duration}m
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Fixed Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onAddNewBlock}
              size="sm"
              className="border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            >
              Add More Blocks
            </Button>
            <Button
              onClick={onCompleteDay}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Complete Day
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllBlocksCompleted;
