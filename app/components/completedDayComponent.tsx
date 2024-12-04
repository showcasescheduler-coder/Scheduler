import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronDown, RotateCcw } from "lucide-react";
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

// CompletedDayView.tsx
interface CompletedDayViewProps {
  completedBlocks: Block[];
  taskCompletionRate: number;
  blockCompletionRate: number;
  performanceRating: PerformanceRating;
  onReactivateDay: () => void;
}

const CompletedDayView: React.FC<CompletedDayViewProps> = ({
  completedBlocks,
  taskCompletionRate,
  blockCompletionRate,
  performanceRating,
  onReactivateDay,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Day Complete
        </h1>
        <Button variant="outline" size="sm" onClick={onReactivateDay}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reactivate Day
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{"Today's Summary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedBlocks.map((block) => (
                <Collapsible key={block._id}>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{block.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {block.startTime} - {block.endTime}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <CollapsibleTrigger>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent className="mt-2 ml-4 space-y-2">
                    {block.tasks?.map((task) => (
                      <div key={task._id} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{task.name}</span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Productivity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Tasks Completed</span>
                  <span className="font-semibold">
                    {Math.round(taskCompletionRate)}%
                  </span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Time Blocks Completed</span>
                  <span className="font-semibold">
                    {Math.round(blockCompletionRate)}%
                  </span>
                </div>
                <Progress value={blockCompletionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Overall Completion</span>
                  <span className="font-semibold">
                    {Math.round((taskCompletionRate + blockCompletionRate) / 2)}
                    %
                  </span>
                </div>
                <Progress
                  value={(taskCompletionRate + blockCompletionRate) / 2}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Performance Rating: {performanceRating.level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-primary mb-4">
                {performanceRating.score}/10
              </div>
              <p className="text-center text-muted-foreground">
                {performanceRating.comment}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompletedDayView;
