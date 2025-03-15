import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Info, RotateCcw, Check, X, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Task, Block } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import BlockTypeBadge from "./BlockTypeBadge";
import SourceBadge from "./SourceBadge";
import BlockProgress from "./BlockProgress";
import TaskSourceBadge from "./TaskSourceBadge";

interface CompletedBlockProps {
  block: Block;
  onReactivateBlock: (blockId: string) => void;
  hideReactivateButton?: boolean;
}

const CompletedBlock: React.FC<CompletedBlockProps> = ({
  block,
  onReactivateBlock,
  hideReactivateButton = false,
}) => {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <div className="flex items-center gap-2">
            {block.name}
            {/* {block.isStandaloneBlock && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                AI Optimized
              </span>
            )} */}
            {/* Event Badge */}
            {block.event && (
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1 bg-rose-50 text-rose-700 border-rose-200 font-medium"
              >
                <Calendar className="h-3 w-3" />
                Event
              </Badge>
            )}

            {/* Block Type Badge */}
            {block.blockType && <BlockTypeBadge type={block.blockType} />}

            {/* Source Badge */}
            {block.routineId && <SourceBadge type={block.routineId} />}

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
                <div className="flex-shrink-0 mt-0.5 w-4 h-4">
                  {task.completed ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    <label
                      htmlFor={`task-${task._id}`}
                      className={`text-sm font-medium truncate leading-none pt-0.5 ${
                        task.completed ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {task.name}
                    </label>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                      {task.duration}
                      <span className="hidden md:inline">min</span>
                    </span>
                    <TaskSourceBadge task={task} />
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
        ))}
        {!hideReactivateButton && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onReactivateBlock(block._id)}
            >
              <RotateCcw className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Reactivate</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedBlock;
