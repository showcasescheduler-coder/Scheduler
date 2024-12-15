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
}

const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
  onCompleteDay,
  onAddNewBlock,
  blocks = [],
}) => {
  return (
    <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center h-full p-6 space-y-8">
        {/* Celebration Icon */}
        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-blue-600" />
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            All Blocks Completed!
          </h2>
          <p className="text-gray-500 max-w-md">
            {
              "Great work! You've completed all your scheduled blocks for today. Would you like to end your day or add more blocks?"
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onAddNewBlock}
            className="min-w-[140px] border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            Add More Blocks
          </Button>
          <Button
            onClick={onCompleteDay}
            className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
          >
            Complete Day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllBlocksCompleted;
