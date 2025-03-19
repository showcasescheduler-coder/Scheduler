import React, { useMemo, useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { PreviewTaskCard } from "./PreviewTaskCard";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Edit,
  Info,
  Plus,
  Check,
  LinkIcon,
  MoreVertical,
  Trash2,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BlockProgress from "./BlockProgress";
import BlockTypeBadge from "./BlockTypeBadge";
import SourceBadge from "./SourceBadge";
import { Block, Task } from "@/app/context/models";
import BlockDurationIndicator from "./BlockDurationIndicator";
import { Badge } from "@/components/ui/badge";

interface EventData {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  eventType?: string;
  isRecurring: boolean;
}

interface TimeBlockProps {
  block: Block;
  onDeleteBlock: (block: Block) => Promise<void>;
  onEditBlock: (block: Block) => void;
  onAddTask: (blockId: string) => void;
  onCompleteBlock: (blockId: string) => Promise<void>;
  onTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  onEditTask: (task: Task) => void;
  onRemoveTask: (task: Task, block: Block) => Promise<void>;
  onDeleteTask: (task: Task, block: Block) => Promise<void>;
  updatingTasks: boolean;
  updatingTaskId: string | null;
  onStartFocusSession?: (block: Block) => void;
}

export function PreviewTimeBlock({
  block,
  onDeleteBlock,
  onEditBlock,
  onAddTask,
  onCompleteBlock,
  onTaskCompletion,
  onEditTask,
  onRemoveTask,
  onDeleteTask,
  updatingTasks,
  updatingTaskId,
  onStartFocusSession,
}: TimeBlockProps) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(false);
  const isEventBlock = !!block.event || !!block.eventId; // Check both properties

  // Add the useEffect to fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      if (isEventBlock) {
        setIsLoadingEvent(true);
        try {
          const response = await fetch("/api/get-event-by-id", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eventId: block.event || block.eventId }),
          });

          if (response.ok) {
            const data = await response.json();
            setEventData(data);
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
        } finally {
          setIsLoadingEvent(false);
        }
      }
    };

    fetchEventData();
  }, [block.event, block.eventId, isEventBlock]);

  const displayMeetingLink =
    eventData && !eventData.isRecurring
      ? eventData.meetingLink
      : block.meetingLink;

  // DnD setup
  const { setNodeRef } = useDroppable({
    id: block._id,
    data: {
      type: "Block",
      block,
    },
  });

  // Calculate progress
  const calculateProgress = () => {
    if (block.tasks.length === 0) return 0;
    const completedTasks = block.tasks.filter((task) => task.completed).length;
    return (completedTasks / block.tasks.length) * 100;
  };

  // Check if all tasks are completed
  const allTasksCompleted =
    block.tasks.length > 0 && block.tasks.every((task) => task.completed);

  const taskIds = useMemo(() => {
    return block.tasks.map((task) => task._id);
  }, [block.tasks]);

  return (
    <Card ref={setNodeRef} className="border-gray-200 shadow-sm">
      {/* Mobile time strip */}
      <div className="md:hidden w-full bg-gray-100 border-b flex items-center justify-center py-2">
        <div className="flex items-center text-gray-700 font-medium">
          <Clock className="mr-2 h-4 w-4" />
          <span>
            {block.startTime} - {block.endTime}
          </span>
        </div>
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex-1">
          <div className="flex items-center gap-2">
            {block.name}

            {isEventBlock && (
              <Badge
                variant="outline"
                className={`text-xs flex items-center gap-1 ${
                  eventData?.isRecurring
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                } font-medium`}
              >
                <Calendar className="h-3 w-3" />
                {isLoadingEvent
                  ? "Loading..."
                  : eventData?.isRecurring
                  ? "Recurring Event"
                  : "Event"}
              </Badge>
            )}
            {block.blockType && <BlockTypeBadge type={block.blockType} />}
            {block.routineId && <SourceBadge type={block.routineId} />}

            {/* Duration Indicator - NEW! */}
            <BlockDurationIndicator
              startTime={block.startTime}
              endTime={block.endTime}
              tasks={block.tasks}
            />

            {/* <SourceBadge
              isEvent={block.isEvent}
              isRoutine={block.isRoutine}
              eventId={block.eventId}
              routineId={block.routineId}
            /> */}
            {/* {block.isStandaloneBlock && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                <Sparkles className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">AI Optimized</span>
              </span>
            )} */}
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
            {/* <BlockProgress tasks={block.tasks} /> */}
          </div>
        </CardTitle>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center text-sm text-gray-500">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {block.startTime} - {block.endTime}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem className="md:hidden">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {block.startTime} - {block.endTime}
                </span>
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onEditBlock(block)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Block</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteBlock(block)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Block</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {block.tasks.map((task) => (
            <PreviewTaskCard
              key={task._id}
              task={task}
              block={block}
              updatingTasks={updatingTasks}
              updatingTaskId={updatingTaskId}
              onTaskCompletion={onTaskCompletion}
              onEditTask={onEditTask}
              onRemoveTask={onRemoveTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>

        <div className="flex justify-between items-center mt-4">
          {/* Only show Add Task button if not an event block */}
          {!block.eventId && !block.event && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-sm"
              onClick={() => onAddTask(block._id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
        </div>
        {/* Similar to TimeBlock component */}
        {eventData?.meetingLink ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed opacity-60"
            asChild
          >
            <span className="flex items-center">
              <LinkIcon className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Join Meeting (Preview)</span>
            </span>
          </Button>
        ) : (
          <></>
          // <Button
          //   variant="outline"
          //   size="sm"
          //   className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          //   onClick={() => onStartFocusSession?.(block)}
          // >
          //   <Clock className="h-4 w-4 md:mr-1" />
          //   <span className="hidden md:inline">Start</span>
          // </Button>
        )}
      </CardContent>
    </Card>
  );
}
