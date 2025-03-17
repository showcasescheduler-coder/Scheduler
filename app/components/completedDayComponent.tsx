import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCheck,
  CheckCircle,
  Clock,
  LayoutDashboard,
  ListTodo,
  RotateCcw,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CompletedBlock from "./CompletedBlocks";
import { Block, Task } from "@/app/context/models";

interface CompletedDayViewProps {
  completedBlocks: Block[];
  taskCompletionRate: number;
  blockCompletionRate: number;
  onReactivateDay: () => void;
  onReactivateBlock: (blockId: string) => void; // Updated to accept blockId parameter
}

const CompletedDayView: React.FC<CompletedDayViewProps> = ({
  completedBlocks,
  taskCompletionRate,
  blockCompletionRate,
  onReactivateDay,
  onReactivateBlock,
}) => {
  const totalTasks = completedBlocks.reduce(
    (sum, block) => sum + block.tasks.length,
    0
  );
  const completedTasks = completedBlocks.reduce(
    (sum, block) => sum + block.tasks.filter((t) => t.completed).length,
    0
  );

  const getBlockColor = (blockType: string) => {
    switch (blockType) {
      case "deep-work":
        return "blue";
      case "planning":
        return "purple";
      case "break":
        return "emerald";
      case "admin":
        return "indigo";
      case "collaboration":
        return "amber";
      default:
        return "blue";
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full ">
      <Card className="flex h-full w-full flex-col bg-white border border-gray-200 shadow-sm ">
        <div className="relative flex h-full flex-col overflow-hidden">
          {/* Subtle top accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

          <CardContent className="h-full p-4 md:p-8 flex flex-col relative z-10">
            {/* Header section with improved styling */}
            <div className="flex-none mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Day Complete
                  </h1>
                  <p className="text-sm text-gray-600">
                    {
                      "Great job! You've finished your scheduled activities for today."
                    }
                  </p>
                </div>
                <Button
                  onClick={onReactivateDay}
                  className="gap-2 w-full md:w-auto bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-colors"
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 text-blue-500" />
                  <span>Reactivate Day</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards section with improved styling and hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Card 1 */}
              <div className="group">
                <Card className="relative bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-blue-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">
                      Total Tasks
                    </CardTitle>
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">
                      {completedTasks}/{totalTasks}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Tasks completed today
                    </p>
                    {completedTasks > 0 && (
                      <div className="mt-2 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{
                            width: `${(completedTasks / totalTasks) * 100}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Card 2 */}
              <div className="group">
                <Card className="relative bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-purple-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">
                      Task Completion
                    </CardTitle>
                    <ListTodo className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">
                      {Math.round(taskCompletionRate)}%
                    </div>
                    <Progress
                      value={taskCompletionRate}
                      className="h-1.5 mt-2 bg-gray-100"
                    >
                      <div className="h-full bg-purple-400 rounded-full" />
                    </Progress>
                  </CardContent>
                </Card>
              </div>

              {/* Card 3 */}
              <div className="group">
                <Card className="relative bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-emerald-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">
                      Total Blocks Coompleted
                    </CardTitle>
                    <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">
                      {completedBlocks.length}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Blocks completed today
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section divider with title */}
            <div className="w-full max-w-4xl mb-6 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200 flex-1"></div>
              <div className="px-4 text-gray-900 text-lg font-semibold flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                <span>Completed Work</span>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-200 flex-1"></div>
            </div>

            {/* Completed Blocks & Tasks with improved styling */}
            <div className="flex-grow overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto flex-grow pb-4 px-1">
                <div className="space-y-4">
                  {completedBlocks.map((block) => (
                    <CompletedBlock
                      key={block._id}
                      block={block}
                      onReactivateBlock={onReactivateBlock}
                      hideReactivateButton={true} // Always hide reactivate button in CompletedDayView
                    />
                  ))}

                  {/* Empty state message when no blocks */}
                  {completedBlocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                      <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <ListTodo className="h-7 w-7 text-gray-400" />
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">
                        No Completed Blocks Yet
                      </h3>
                      <p className="text-gray-600 max-w-md">
                        Your completed blocks will appear here. Keep track of
                        your progress and celebrate your accomplishments as you
                        finish tasks throughout the day.
                      </p>
                      <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default CompletedDayView;
