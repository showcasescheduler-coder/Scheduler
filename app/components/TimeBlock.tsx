import React, { useMemo, useEffect, useState, useRef, useContext } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
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
import { Badge } from "@/components/ui/badge";
import BlockDurationIndicator from "./BlockDurationIndicator";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";

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
  isTodayView: boolean; // Add this
}

export function TimeBlock({
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
  isTodayView,
}: TimeBlockProps) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(false);
  const router = useRouter();
  const isEventBlock = !!block.event;
  const blockRef = useRef(block);
  const { events } = useAppContext();
  // DnD setup

  useEffect(() => {
    if (isEventBlock && events && block.event) {
      // Find the updated event from the global events array
      const updatedEvent = events.find((e) => e._id === block.event);
      if (updatedEvent) {
        setEventData(updatedEvent);
      }
    }
  }, [events, block.event, isEventBlock]);

  useEffect(() => {
    blockRef.current = block;
  }, [block]);

  useEffect(() => {
    if (isEventBlock) {
      console.log("Event block detected:", {
        blockId: block._id,
        blockName: block.name,
        eventId: block.event,
        eventData,
        isRecurring: eventData?.isRecurring,
      });
    }
  }, [block, eventData, isEventBlock]);

  const { setNodeRef } = useDroppable({
    id: block._id,
    data: {
      type: "Block",
      block: {
        ...block,
        _eventData: eventData,
      } as Block & { _eventData?: EventData | null },
    },
  });

  // Fetch event data if this block has an event reference
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
            body: JSON.stringify({ eventId: block.event }),
          });

          if (response.ok) {
            const data = await response.json();
            setEventData(data);

            // Attach the event data to the block object for DnD access
            if (blockRef.current) {
              blockRef.current._eventData = data;
            }
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
        } finally {
          setIsLoadingEvent(false);
        }
      }
    };

    fetchEventData();
  }, [block.event, isEventBlock]);

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

  const displayName =
    eventData && !eventData.isRecurring ? eventData.name : block.name;
  const displayDescription =
    eventData && !eventData.isRecurring
      ? eventData.description
      : block.description;
  const displayMeetingLink =
    eventData && !eventData.isRecurring
      ? eventData.meetingLink
      : block.meetingLink;
  const displayStartTime =
    eventData && !eventData.isRecurring ? eventData.startTime : block.startTime;
  const displayEndTime =
    eventData && !eventData.isRecurring ? eventData.endTime : block.endTime;

  const handleEditClick = () => {
    if (isEventBlock && eventData) {
      // Navigate to event edit page
      router.push(`/dashboard/events/${eventData._id}`);
    } else {
      // Use regular edit block function
      onEditBlock(block);
    }
  };

  return (
    <Card ref={setNodeRef} className="border-gray-200 shadow-sm">
      {/* Mobile time strip */}
      <div className="md:hidden w-full bg-gray-100 border-b flex items-center justify-center py-2">
        <div className="flex items-center text-gray-700 font-medium">
          <Clock className="mr-2 h-4 w-4" />
          <span>
            {displayStartTime} - {displayEndTime}
          </span>
        </div>
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex-1">
          <div className="flex items-center gap-2">
            {isLoadingEvent ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              displayName
            )}

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
                {eventData?.isRecurring ? "Recurring Event" : "Event"}
              </Badge>
            )}

            {block.blockType && <BlockTypeBadge type={block.blockType} />}
            {block.routineId && <SourceBadge type={block.routineId} />}

            <BlockDurationIndicator
              startTime={displayStartTime}
              endTime={displayEndTime}
              tasks={block.tasks}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{displayDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {!isEventBlock && <BlockProgress tasks={block.tasks} />}
          </div>
        </CardTitle>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center text-sm text-gray-500">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {displayStartTime} - {displayEndTime}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                <span>
                  {eventData?.isRecurring
                    ? "Edit Occurance"
                    : eventData
                    ? "Edit Event"
                    : "Edit Block"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteBlock(block)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isEventBlock ? "Remove Event from Day" : "Delete Block"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {!isEventBlock ? (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {block.tasks.map((task: Task) => (
              <TaskCard
                key={task._id}
                task={task}
                block={block}
                updatingTasks={updatingTasks}
                updatingTaskId={updatingTaskId}
                onTaskCompletion={onTaskCompletion}
                onEditTask={onEditTask}
                onRemoveTask={onRemoveTask}
                onDeleteTask={onDeleteTask}
                isTodayView={isTodayView}
                isReadOnly={false}
              />
            ))}
          </SortableContext>
        ) : null}

        <div className="flex justify-end items-center gap-2 mt-4">
          {!isEventBlock && (
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

          {/* Only show action buttons for today's view */}
          {isTodayView && (
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

              {/* Similar to TimeBlock component */}
              {displayMeetingLink ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  asChild
                >
                  <a
                    href={displayMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <LinkIcon className="h-4 w-4 md:mr-1" />
                    <span className="hidden md:inline">Join Meeting</span>
                  </a>
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
