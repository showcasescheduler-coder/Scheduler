"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Day } from "@/app/context/models";
import {
  Clock,
  Plus,
  Sparkles,
  Menu,
  ChevronDown,
  MoreVertical,
  GripVertical,
  Edit,
  Trash2,
  Check,
  Repeat,
  Brain,
  Info,
  PlusCircle,
  ClipboardList,
  LinkIcon,
  Calendar,
  X,
  LayoutDashboard,
  ListTodo,
  BarChart2,
  FolderKanban,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleGenerationDialog } from "@/dialog/generateModal";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarContent } from "@/app/components/SideBar";
import { AddEventModal } from "@/dialog/addEventModal";
import { AddRoutineModal } from "@/dialog/addRoutineModal";
import { AddBlockDialog } from "@/dialog/addBlockModal";
import SchedulePreview from "@/app/components/schedulePreview";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserAndDay } from "@/hooks/useUserAndDay";
import { AddTaskModal } from "@/dialog/addTaskModal";
import toast from "react-hot-toast";
import { EditTaskDialog } from "@/dialog/editTask";
import { EditBlockDialog } from "@/dialog/editBlockModal";
import { useAuth } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import CompletedDayView from "@/app/components/completedDayComponent";
import AllBlocksCompleted from "../components/allBlocksCompleteted";
import Link from "next/link";
import CompletedBlock from "../components/CompletedBlocks";
import ActiveBlockCard from "../components/ActiveBlockCard";
import NoBlocksCard from "../components/NoBlocksScheduledCard";
import MobileNav from "../components/MobileNav";
import BlockProgress from "../components/BlockProgress";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import ScheduleGenerationSpinner from "../components/ScheduleGenerationSpinner";
import FocusSession from "@/dialog/startBlockModal";
// Add these imports at the top of your file
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/app/components/TaskCard";
import { TimeBlock } from "../components/TimeBlock";
import { arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  Active,
} from "@dnd-kit/core";
import {
  PreviewSchedule,
  PreviewBlock,
  Block,
  Task,
} from "@/app/context/models"; // adjust the import path if needed

// interface Task {
//   _id: string;
//   block: string;
//   blockId?: string;
//   dayId: string;
//   name: string;
//   description: string;
//   duration: string;
//   priority: "High" | "Medium" | "Low";
//   status: "pending" | "in_progress" | "completed";
//   type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   isRoutineTask: boolean;
//   completed: boolean;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   deadline?: string;
//   project?: string;
//   routine?: string;
//   projectId?: string;
// }

type EditableBlockFields = {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  status: "pending" | "complete" | "incomplete";
  meetingLink?: string;
};

// interface Block {
//   _id: string;
//   dayId: string;
//   name: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   status: "pending" | "complete" | "incomplete";
//   blockType:
//     | "deep-work"
//     | "break"
//     | "meeting"
//     | "health"
//     | "exercise"
//     | "admin"
//     | "personal";
//   event: string | null;
//   tasks: Task[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   isStandaloneBlock?: boolean;
//   meetingLink: string;
// }

interface DragData {
  type: "Task" | "Block";
  task?: Task;
  block?: Block;
}

interface ScheduleTemplate {
  title: string;
  icon: any;
  description: string;
  promptPoints: string[]; // Changed from prompt string to promptPoints array
  color: string;
  shortcut?: string;
}

// Define interface for streaming schedule block
interface StreamingBlock {
  _id?: string; // now optional
  name: string;
  startTime: string;
  endTime: string;
  blockType: string;
  tasks: any[];
  description?: string;
  isEvent?: boolean;
  isRoutine?: boolean;
  isStandaloneBlock?: boolean;
  energyLevel?: string;
  [key: string]: any; // Allow for additional properties
}

// Define interface for streaming schedule
interface StreamingSchedule {
  currentTime: string;
  scheduleRationale: string;
  userStartTime: string;
  userEndTime: string;
  blocks: StreamingBlock[];
}

export default function Component() {
  const {
    selectedDay,
    setSelectedDay: setContextSelectedDay,
    isGeneratingSchedule,
    setIsGeneratingSchedule,
  } = useAppContext();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] = useState(false);
  const { promptText, setPromptText } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [updatingTasks, setUpdatingTasks] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const {
    isPreviewMode,
    setIsPreviewMode,
    previewSchedule,
    setPreviewSchedule,
    setDay,
    tasks,
    projects,
    events,
    routines,
    setTasks,
    setProjects,
    setEvents,
    setRoutines,
  } = useAppContext();
  const [hasProcessedPrompt, setHasProcessedPrompt] = useState(false);
  const { user, day, mutate, isError } = useUserAndDay();
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortedBlocks, setSortedBlocks] = useState<Block[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditBlockDialogOpen, setIsEditBlockDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [focusSessionBlock, setFocusSessionBlock] = useState<Block | null>(
    null
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [previousTask, setPreviousTask] = useState<Task | null>(null);
  const [lastGenerationInput, setLastGenerationInput] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplate | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamedBlocks, setStreamedBlocks] = useState<any[]>([]);
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [streamingSchedule, setStreamingSchedule] = useState<StreamingSchedule>(
    {
      currentTime: new Date().toLocaleTimeString(),
      scheduleRationale: "",
      userStartTime: "",
      userEndTime: "",
      blocks: [],
    }
  );
  const [rationaleText, setRationaleText] = useState("");
  const generationStartedRef = useRef(false);

  const lastUpdateRef = useRef<number>(0);
  const THROTTLE_MS = 150; // Minimum time between updates
  const updateQueueRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);
  const frameRef = useRef<number>();

  const throttledMutate = (updateFn: any) => {
    const now = Date.now();
    if (now - lastUpdateRef.current > THROTTLE_MS) {
      lastUpdateRef.current = now;
      mutate(updateFn, false);
    }
  };

  const router = useRouter();

  const { isLoaded, userId } = useAuth();

  const LoadingSpinner = () => (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="relative">
        <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-12 text-sm text-gray-500">Generating your schedule...</p>
    </div>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const transformToPreviewSchedule = (
    streaming: StreamingSchedule
  ): PreviewSchedule => {
    return {
      currentTime: streaming.currentTime,
      scheduleRationale: streaming.scheduleRationale,
      userStartTime: streaming.userStartTime,
      userEndTime: streaming.userEndTime,
      blocks: streaming.blocks.map(
        (block, index): PreviewBlock => ({
          // Ensure _id is defined. If it’s missing in the streaming block, create a temporary one.
          _id: block._id ?? `temp-${index}`,
          name: block.name,
          startTime: block.startTime,
          endTime: block.endTime,
          description: block.description || "",
          isEvent: block.isEvent ?? false,
          isRoutine: block.isRoutine ?? false,
          isStandaloneBlock: block.isStandaloneBlock ?? false,
          // Cast or map blockType and energyLevel as needed
          blockType: block.blockType as
            | "deep-work"
            | "break"
            | "meeting"
            | "health"
            | "exercise"
            | "admin"
            | "personal",
          energyLevel:
            (block.energyLevel as "high" | "medium" | "low") ?? "medium",
          // If you need to transform tasks, do so here.
          tasks: block.tasks,
          type: "deep-work",
          routineId: null,
        })
      ),
    };
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleTemplateSelect = (template: ScheduleTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  // Then modify how you handle day selection in both mobile and desktop views:
  const handleDayChange = (value: "today" | "tomorrow") => {
    setContextSelectedDay(value); // This triggers the useUserAndDay hook to fetch/create the day
  };

  const currentDate = selectedDay === "today" ? today : tomorrow;

  const getFilteredBlocks = () => {
    if (!day || !day.blocks) return [];

    const blocks = [...day.blocks].sort((a: Block, b: Block) => {
      const timeA = a.startTime
        ? new Date(`1970-01-01T${a.startTime}:00`)
        : new Date(0);
      const timeB = b.startTime
        ? new Date(`1970-01-01T${b.startTime}:00`)
        : new Date(0);
      return timeA.getTime() - timeB.getTime();
    });

    return blocks.filter((block: Block) =>
      activeTab === "active"
        ? block.status !== "complete"
        : block.status === "complete"
    );
  };

  const processUpdate = (updateFn: any) => {
    const now = Date.now();

    // If we have a queued update, cancel it
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Store the latest update
    updateQueueRef.current = updateFn;

    // Schedule the next update
    frameRef.current = requestAnimationFrame(() => {
      if (updateQueueRef.current) {
        mutate(updateQueueRef.current, false);
        updateQueueRef.current = null;
        isUpdatingRef.current = false;
      }
    });
  };

  useEffect(() => {
    if (day && day.blocks) {
      console.log("Day data updated, setting sorted blocks");
      setSortedBlocks(getFilteredBlocks());
    }
  }, [day, activeTab]);

  const scheduleDate =
    selectedDay === "today"
      ? new Date()
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          return d;
        })();

  const generateSchedule = async () => {
    setGenerationProgress(0);
    setGenerationStatus("Initializing...");
    const { startTime, endTime } = getScheduleTimes(selectedDay);
    console.log("this is the start time", startTime);
    console.log("this is the end time", endTime);
    console.log(selectedDay);
    try {
      // Intent Analysis
      setGenerationProgress(10);
      setGenerationStatus("Analyzing your requirements...");

      // Schedule Generation
      setGenerationProgress(30);
      setGenerationStatus("Generating your schedule...");
      console.log("running the homepage specific");
      const scheduleResponse = await fetch("/api/home-page-specific", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: promptText,
          startTime: startTime,
          endTime: endTime,
        }),
      });

      setGenerationProgress(80);
      setGenerationStatus("Finalizing your schedule...");
      // Initialize a local schedule to accumulate partial data
      let localSchedule = {
        currentTime: new Date().toLocaleTimeString(),
        scheduleRationale: "",
        userStartTime: startTime,
        userEndTime: endTime,
        blocks: [] as any[], // or use your Block[] type
        date: scheduleDate.toISOString().split("T")[0], // e.g., "2025-02-07"
      };

      streamSchedule(scheduleResponse, localSchedule);
      setGenerationProgress(100);
      setGenerationStatus("Schedule generated successfully!");
    } catch (error) {
      console.error("Failed to generate schedule:", error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Give time to see 100%
      setIsGeneratingSchedule(false);
      // IMPORTANT: mark that we've processed
      setHasProcessedPrompt(true);
      setGenerationProgress(0);
      setGenerationStatus("");
      setPromptText("");
    }
  };

  // const generateSchedule = async () => {
  //   setGenerationProgress(0);
  //   setGenerationStatus("Initializing...");
  //   try {
  //     // Intent Analysis
  //     setGenerationProgress(10);
  //     setGenerationStatus("Analyzing your requirements...");
  //     const intentResponse = await fetch("/api/home-page-intent-analysis", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userInput: promptText,
  //         startTime: "09:00",
  //         endTime: "17:00",
  //       }),
  //     });

  //     const intentAnalysis = await intentResponse.json();

  //     // Schedule Generation
  //     setGenerationProgress(30);
  //     setGenerationStatus("Generating your schedule...");
  //     console.log("Intent analysis", intentAnalysis);
  //     const endpoint = intentAnalysis.isSpecificRequest
  //       ? "/api/home-page-specific"
  //       : "/api/home-page-non-specific";

  //     const scheduleResponse = await fetch(endpoint, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userInput: promptText,
  //         startTime: "09:00",
  //         endTime: "17:00",
  //       }),
  //     });

  //     setGenerationProgress(60);
  //     setGenerationStatus("Optimizing block placement...");

  //     const schedule = await scheduleResponse.json();
  //     console.log(schedule);
  //     setGenerationProgress(80);
  //     setGenerationStatus("Finalizing your schedule...");

  //     if (schedule.blocks) {
  //       setGenerationProgress(100);
  //       setGenerationStatus("Schedule generated successfully!");
  //       setPreviewSchedule(schedule);
  //       setIsPreviewMode(true);
  //     }
  //   } catch (error) {
  //     console.error("Failed to generate schedule:", error);
  //   } finally {
  //     await new Promise((resolve) => setTimeout(resolve, 500)); // Give time to see 100%
  //     setIsGeneratingSchedule(false);
  //     // IMPORTANT: mark that we've processed
  //     setHasProcessedPrompt(true);
  //     setGenerationProgress(0);
  //     setGenerationStatus("");
  //   }
  // };

  useEffect(() => {
    // Only generate if promptText exists, no schedule has been generated yet,
    // and generation has not already started.
    if (promptText && !previewSchedule && !generationStartedRef.current) {
      generationStartedRef.current = true;
      generateSchedule();
    }
  }, [promptText, previewSchedule]);

  useEffect(() => {
    // Only run the check after Clerk has loaded
    if (isLoaded) {
      // If user is not authenticated AND not in preview mode AND there's no promptText, redirect to homepage
      if (!userId && !isPreviewMode && !promptText) {
        router.push("/");
      }
    }
  }, [isLoaded, userId, isPreviewMode, promptText, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Optionally, set an error state here to show an error message to the user
      }
    };

    fetchEvents();
  }, [setEvents]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [setProjects]);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch(`/api/routines?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch routines");
        }
        const data = await response.json();
        setRoutines(data);
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast.error("Failed to fetch routines. Please try again.");
      }
    };

    fetchRoutines();
  }, [setRoutines]);

  useEffect(() => {
    // Fetch tasks from the API
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks. Please try again.");
      }
    };

    fetchTasks();
  }, [setTasks]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if Meta/Ctrl is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevent default browser behavior

        switch (e.key.toLowerCase()) {
          case "g": // Generate Schedule
            // Remove the blocks check and just open the dialog
            setIsDialogOpen(true);
            break;

          case "b": // Add Block
            setIsAddBlockDialogOpen(true);
            break;

          case "e": // Add Event
            setIsAddEventModalOpen(true);
            break;

          case "r": // Add Routine
            setIsAddRoutineModalOpen(true);
            break;
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const OpenNewBlockModal = () => {
    setIsAddBlockDialogOpen(true);
  };

  const OpenNewEventModal = () => {
    setIsAddEventModalOpen(true);
  };

  const OpenNewRoutineModal = () => {
    setIsAddRoutineModalOpen(true);
  };

  const handleAddTask = (blockId: string) => {
    console.log("Adding task to block:", blockId);
    setSelectedBlockId(blockId);
    setIsAddTaskModalOpen(true);
  };

  const handleAddTaskToBlock = () => {
    setIsAddTaskModalOpen(false);
  };

  const updateDay = () => {
    mutate();
  };

  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!day) return;
    setUpdatingTasks(true);
    setUpdatingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed,
          dayId: day._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status");
      }

      const { updatedTask, updatedDay } = await response.json();

      // Update local state
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((block) => {
            if (typeof block === "string") return block;
            return {
              ...block,
              tasks: block.tasks.map((task) =>
                task._id === taskId ? updatedTask : task
              ),
            };
          }),
        }),
        false
      );
    } catch (error) {
      console.error("Error updating task completion status:", error);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingTasks(false);
      setUpdatingTaskId(null);
    }
  };

  const handleRemoveTaskFromBlock = async (task: Task, block: Block) => {
    if (
      window.confirm(
        "Are you sure you want to remove this task from the block? It will still be available in your task list."
      )
    ) {
      try {
        const response = await fetch(`/api/blocks/${block._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "removeTask",
            taskId: task._id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove task from block");
        }

        // Instead of relying on the response data, we'll update the state directly
        mutate(
          (currentDay: Day) => ({
            ...currentDay,
            blocks: currentDay.blocks.map((b) => {
              // If it's a string, return as is
              if (typeof b === "string") return b;

              // If this is not the block we're modifying, return as is
              if (b._id !== block._id) return b;

              // If this is the block we're modifying, filter out the task
              return {
                ...b,
                tasks: b.tasks.filter((t) => t._id !== task._id),
              };
            }),
          }),
          false
        );

        toast.success("Task removed from block and moved to your task list");
      } catch (error) {
        console.error("Error removing task from block:", error);
        toast.error("Failed to remove task from block. Please try again.");
      }
    }
  };

  const handleDeleteTask = async (task: Task, block: Block) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this ${
          task.isRoutineTask ? "routine" : ""
        } task?`
      )
    ) {
      try {
        const response = await fetch(`/api/tasks/${task._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        // Update the local state directly using the task ID
        mutate(
          (currentDay: Day) => ({
            ...currentDay,
            blocks: currentDay.blocks.map((b) => {
              // If it's a string, return as is
              if (typeof b === "string") return b;

              // If this is not the block containing the task, return as is
              if (b._id !== block._id) return b;

              // If this is the block containing the task, filter out the deleted task
              return {
                ...b,
                tasks: b.tasks.filter((t) => t._id !== task._id),
              };
            }),
          }),
          false
        );

        toast.success("Task deleted successfully");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task. Please try again.");
      }
    }
  };

  const handleSaveTask = async (updatedTask: Task) => {
    console.log("Saving task:", updatedTask);
    try {
      const response = await fetch(
        `/api/edit-schedule-task/${updatedTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Update the local state
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((block) => {
            if (typeof block === "string") return block;
            return {
              ...block,
              tasks: block.tasks.map((task) =>
                task._id === updatedTask._id ? updatedTask : task
              ),
            };
          }),
        }),
        false
      );
    } catch (error) {
      console.error("Error updating task:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  // Add this handler where you open the edit dialog:
  const handleEditTask = (task: Task) => {
    console.log("Is the edit task working");
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };

  // Convert a time string "HH:mm" to minutes since midnight.
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Check if a given time is within a start and end boundary.
  const isTimeWithinRange = (
    timeStr: string,
    rangeStart: string,
    rangeEnd: string
  ): boolean => {
    const time = timeToMinutes(timeStr);
    const start = timeToMinutes(rangeStart);
    const end = timeToMinutes(rangeEnd);
    return time >= start && time <= end;
  };

  // Check if two time ranges overlap.
  // Returns true if range A (startA, endA) overlaps with range B (startB, endB).
  const doTimesOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean => {
    return (
      timeToMinutes(startA) < timeToMinutes(endB) &&
      timeToMinutes(endA) > timeToMinutes(startB)
    );
  };

  const validateBlockTime = (
    newBlock: Partial<Block>,
    existingBlocks: any[],
    dayStartTime: string,
    dayEndTime: string,
    currentBlockId: string | null = null
  ): string | null => {
    // Early return if required fields are missing
    if (!newBlock.startTime || !newBlock.endTime) {
      return "Start time and end time are required.";
    }

    // Ensure the block's start time comes before its end time.
    if (timeToMinutes(newBlock.startTime) >= timeToMinutes(newBlock.endTime)) {
      return "Block start time must be before end time.";
    }

    // Ensure both times are within the allowed day range.
    if (
      !isTimeWithinRange(newBlock.startTime, dayStartTime, dayEndTime) ||
      !isTimeWithinRange(newBlock.endTime, dayStartTime, dayEndTime)
    ) {
      return "Block times must be within the allowed day schedule.";
    }

    // Check against each existing block.
    for (const block of existingBlocks) {
      // If editing an existing block, skip comparing with itself.
      if (currentBlockId && block._id === currentBlockId) continue;

      // If there is an overlap, return an error message.
      if (
        doTimesOverlap(
          newBlock.startTime,
          newBlock.endTime,
          block.startTime,
          block.endTime
        )
      ) {
        return `Block time overlaps with block "${block.name}" (${block.startTime} - ${block.endTime}).`;
      }
    }
    return null;
  };
  const handleAddBlock = async (newBlock: Partial<Block>) => {
    // Get the allowed start and end times for the day.
    const { startTime: dayStartTime, endTime: dayEndTime } =
      getScheduleTimes(selectedDay);

    // Validate the new block times.
    // Validate the new block times.
    const errorMessage = validateBlockTime(
      newBlock,
      day.blocks,
      dayStartTime,
      dayEndTime
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const response = await fetch("/api/add-block-to-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayId: day._id,
          name: newBlock.name,
          startTime: newBlock.startTime,
          endTime: newBlock.endTime,
          userId: userId, // Assuming you have access to userId
          description: newBlock.description,
          blockType: newBlock.blockType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add block");
      }

      const data = await response.json();
      console.log("New block created:", data);

      // Update the day data in the context
      setDay((prevDay) => ({
        ...prevDay,
        blocks: [...prevDay.blocks, data.block],
      }));

      // Close the dialog and reset the form
      setIsDialogOpen(false);

      // Update the day view
      updateDay();
      toast.success("New block added successfully");
    } catch (error) {
      console.error("Error adding block:", error);
      toast.error("Failed to add new block. Please try again.");
      // Handle error (e.g., show an error message to the user)
    }
  };

  function canDeleteBlock(block: Block): boolean {
    return block.tasks.length === 0;
  }

  async function deleteBlock(
    block: Block
  ): Promise<{ success: boolean; message: string }> {
    if (!canDeleteBlock(block)) {
      return {
        success: false,
        message: "Cannot delete block with tasks. Remove all tasks first.",
      };
    }

    console.log("did we get here when deleting block");

    try {
      const response = await fetch(`/api/blocks/${block._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete block");
      }

      return { success: true, message: "Block deleted successfully" };
    } catch (error) {
      console.error("Error deleting block:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  const handleDeleteBlock = async (block: Block) => {
    if (!window.confirm("Are you sure you want to delete this block?")) {
      return;
    }

    try {
      const result = await deleteBlock(block);

      if (result.success) {
        // Update the local state
        mutate(
          (currentDay: Day) => ({
            ...currentDay,
            blocks: currentDay.blocks.filter((b) => {
              if (typeof b === "string") return true;
              return b._id !== block._id;
            }),
          }),
          false
        );
        toast.success("Block deleted successfully");
      } else {
        throw new Error(result.message);
      }
    } catch (error: unknown) {
      console.error("Error deleting block:", error);
      if (error instanceof Error) {
        toast.error(
          "Failed to delete block. Please try again. All tasks must be removed or deleted before you can delete this block"
        );
      } else {
        toast.error(
          "Failed to delete block. Please try again. All tasks must be removed or deleted before you can delete this block"
        );
      }
    }
  };

  const roundToNearestHalfHour = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Round minutes to nearest 30
    const roundedMinutes = Math.round(minutes / 30) * 30;

    // Handle case where rounding pushes us to the next hour
    let finalHours = hours;
    let finalMinutes = roundedMinutes;

    if (roundedMinutes === 60) {
      finalHours = (hours + 1) % 24;
      finalMinutes = 0;
    }

    // Format as HH:mm
    return `${String(finalHours).padStart(2, "0")}:${String(
      finalMinutes
    ).padStart(2, "0")}`;
  };

  const getScheduleTimes = (
    selectedDay: "today" | "tomorrow"
  ): { startTime: string; endTime: string } => {
    const endTime = "22:00"; // 10:00 PM for both cases

    if (selectedDay === "today") {
      // For today, start from current time rounded to nearest half hour
      const currentTime = new Date();
      return {
        startTime: roundToNearestHalfHour(currentTime),
        endTime,
      };
    } else {
      // For tomorrow, start at 8:00 AM
      return {
        startTime: "08:00",
        endTime,
      };
    }
  };

  const streamSchedule = async (
    automatedSchedule: Response,
    localSchedule: StreamingSchedule
  ): Promise<void> => {
    // Immediately set up preview mode with an empty schedule
    setStreamingSchedule(localSchedule);
    // setPreviewSchedule(localSchedule);
    setIsPreviewMode(true);
    setIsGeneratingSchedule(false);
    let accumulatedRationale = "";

    // Read the response as a stream
    const reader = automatedSchedule.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream complete");
          break;
        }
        const chunk = decoder.decode(value);

        // Each chunk can have multiple lines
        const lines = chunk.split("\n");
        for (const line of lines) {
          // SSE lines typically begin "data: ..."
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6);
          if (jsonStr === "[DONE]") {
            // The server signals it's done
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);

            // We expect something like { type: "content_block_delta", delta: { type: "text_delta", text: "..." } }
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta"
            ) {
              const text = parsed.delta.text;

              // Accumulate rationale text
              accumulatedRationale += text;

              const rationaleMatch = accumulatedRationale.match(
                /"scheduleRationale"\s*:\s*"([^"]*)"/
              );

              if (rationaleMatch) {
                console.log("rational found. ");
                const rationale = rationaleMatch[1];
                // console.log("Extracted schedule rationale:", rationale);
                localSchedule = {
                  ...localSchedule,
                  scheduleRationale: rationale, // Update with extracted rationale
                };
              }

              // 2) Check for complete blocks in the raw text
              //    Using a quick pattern to find { ... "tasks": [...] ... } chunks
              const blockMatches = accumulatedRationale.match(
                /\{[^{}]*"tasks"\s*:\s*\[[^\]]*\][^{}]*\}/g
              );
              if (blockMatches) {
                blockMatches.forEach((blockText) => {
                  try {
                    const blockJson = JSON.parse(blockText);

                    // A valid block must have name + startTime, etc.
                    if (blockJson.name && blockJson.startTime) {
                      // Build a new block object
                      const newBlock = {
                        ...blockJson,
                        // convert any "type" to blockType, if needed
                        blockType: blockJson.type || "deep-work",
                        isEvent: blockJson.type === "event",
                        isRoutine: blockJson.type === "routine",
                        isStandaloneBlock: true,
                        energyLevel: "medium",
                        tasks: (blockJson.tasks || []).map((t: any) => ({
                          ...t,
                          priority: t.priority || "Medium",
                          isRoutineTask: false,
                        })),
                      };

                      // Insert the block into localSchedule
                      localSchedule = {
                        ...localSchedule,
                        blocks: [...localSchedule.blocks, newBlock],
                      };
                    }
                  } catch (err) {
                    console.log("Incomplete or invalid block chunk:", err);
                  }
                });

                // Remove the matched block text(s) from rationale to prevent re-parsing
                blockMatches.forEach((m) => {
                  accumulatedRationale = accumulatedRationale.replace(m, "");
                });
              }

              // **Transform and update the preview schedule**
              const preview = transformToPreviewSchedule(localSchedule);
              setStreamingSchedule(localSchedule);
              setPreviewSchedule(preview);
            }
          } catch (parseErr) {
            // Probably partial data not yet parseable
            console.log("Partial chunk—continuing to accumulate");
          }
        }
      }
    }
  };

  const generateScheduleTest = async (userInput: string) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const { startTime, endTime } = getScheduleTimes(selectedDay);
    setLastGenerationInput(userInput);
    setIsGeneratingSchedule(true);
    setGenerationProgress(0);
    setGenerationStatus("Initializing...");
    setIsDialogOpen(false);
    setStreamedText("");
    setStreamedBlocks([]);
    setCurrentBlock(null);
    setIsStreaming(true);
    setStreamingComplete(false);
    let scheduleRationale = "";
    let currentBlockText = "";
    let isCollectingRationale = false;
    let isCollectingBlock = false;
    let accumulatedData = "";
    let accumulatedRationale = "";
    let isRationaleComplete = false;

    // Helper function to convert time to minutes
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Calculate total available minutes
    const availableMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);

    // Calculate total schedulable minutes from all sources
    const projectMinutes = projects.reduce(
      (sum, project) =>
        sum +
        project.tasks.reduce(
          (taskSum, task) => taskSum + (Number(task.duration) || 0),
          0
        ),
      0
    );

    const taskMinutes = tasks.reduce(
      (sum, task) => sum + (Number(task.duration) || 0),
      0
    );

    const eventMinutes = events.reduce(
      (sum, event) =>
        sum + (timeToMinutes(event.endTime) - timeToMinutes(event.startTime)),
      0
    );

    const routineMinutes = routines.reduce(
      (sum, routine) =>
        sum +
        routine.tasks.reduce(
          (taskSum, task) => taskSum + (Number(task.duration) || 0),
          0
        ),
      0
    );

    const totalSchedulableMinutes =
      projectMinutes + taskMinutes + eventMinutes + routineMinutes;
    const hasEnoughTime = totalSchedulableMinutes >= 180; // 3 hours threshold

    console.log(
      `Total schedulable time: ${
        Math.round((totalSchedulableMinutes / 60) * 10) / 10
      } hours`
    );
    console.log(`Threshold met: ${hasEnoughTime}`);

    // Check if there are existing blocks
    const hasExistingBlocks = day.blocks && day.blocks.length > 0;

    // Get the date and day of the week from the state
    const selectedDate = new Date(day.date);
    const formattedSelectedDate = selectedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const selectedDayOfWeek = selectedDate.toLocaleString("en-us", {
      weekday: "long",
    });

    // Fetch the other day's schedule (today if we're looking at tomorrow, or tomorrow if we're looking at today)
    let otherDaySchedule = null;
    const isTomorrow = selectedDate.getDate() === new Date().getDate() + 1;

    try {
      if (isTomorrow) {
        // If we're on tomorrow's page, get today's schedule
        const response = await fetch("/api/get-today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            date: new Date().toISOString().split("T")[0],
          }),
        });
        if (response.ok) {
          otherDaySchedule = await response.json();
        }
      } else {
        // If we're on today's page, get tomorrow's schedule
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const response = await fetch("/api/get-tomorrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            date: tomorrow.toISOString().split("T")[0],
          }),
        });
        if (response.ok) {
          otherDaySchedule = await response.json();
        }
      }
    } catch (error) {
      console.error("Error fetching other day schedule:", error);
    }

    const isTaskAssigned = (taskId: string) => {
      // Check current day's blocks
      const isAssignedToday = day.blocks.some((block: Block) =>
        block.tasks?.some((task) => task._id === taskId)
      );

      // Check other day's blocks
      const isAssignedOtherDay =
        otherDaySchedule?.blocks?.some((block: Block) =>
          block.tasks?.some((task) => task._id === taskId)
        ) || false;

      return isAssignedToday || isAssignedOtherDay;
    };

    // Filter out completed standalone tasks AND tasks that are already assigned
    const incompleteTasks = tasks.filter(
      (task) =>
        !task.isRoutineTask && !task.completed && !isTaskAssigned(task._id)
    );

    // Filter out completed tasks from projects AND tasks that are already assigned
    const projectsWithIncompleteTasks = projects.map((project) => ({
      ...project,
      tasks: project.tasks.filter(
        (task) => !task.completed && !isTaskAssigned(task._id)
      ),
    }));

    // Optimize tasks
    const optimizedTasks = incompleteTasks
      .filter(
        (task) =>
          // Filter out completed and already assigned tasks
          !task.isRoutineTask && !task.completed && !isTaskAssigned(task._id)
      )
      .map((task) => {
        // Check if deadline is within 48 hours
        const deadlineDate = task.deadline ? new Date(task.deadline) : null;
        const now = new Date();
        const hoursUntilDeadline = deadlineDate
          ? (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          : null;

        return {
          id: task._id,
          name: task.name,
          duration: Number(task.duration),
          // Only include deadline if within 48 hours
          ...(hoursUntilDeadline &&
            hoursUntilDeadline <= 48 && {
              deadline: task.deadline,
            }),
        };
      })
      .filter((task) => !isNaN(task.duration) && task.duration > 0);

    // Filter and optimize events
    const optimizedEvents = events
      .filter((event) => {
        // Check for exact date match
        if (event.date) {
          const eventDate = new Date(event.date).toISOString().split("T")[0];
          return eventDate === formattedSelectedDate;
        }

        // Check for recurring event on this day of week
        return event.isRecurring && event.days?.includes(selectedDayOfWeek);
      })
      .map((event) => ({
        id: event._id,
        name: event.name,
        description: event.description?.trim().replace(/\n/g, " ") || "",
        startTime: event.startTime,
        endTime: event.endTime,
      }));

    // Filter and optimize routines
    const optimizedRoutines = routines.map((routine) => ({
      id: routine._id,
      name: routine.name,
      startTimeWindow: {
        earliestStart: routine.startTime, // When this routine can start
        latestStart: routine.endTime, // When this routine needs to end by
      },
      totalDuration: routine.tasks.reduce(
        (sum, task) => sum + Number(task.duration),
        0
      ),
      tasks: routine.tasks.map((task) => ({
        name: task.name,
        duration: Number(task.duration),
      })),
    }));

    // Modified code with sequence numbers:
    const optimizedProjects = projectsWithIncompleteTasks
      .filter((project) => {
        // Filter out completed projects
        const hasIncompleteTasks = project.tasks.some(
          (task) => !task.completed
        );

        // Keep only if has incomplete tasks and not completed itself
        return hasIncompleteTasks && !project.completed;
      })
      .map((project, index) => {
        // Check if deadline is within 48 hours
        const deadlineDate = project.deadline
          ? new Date(project.deadline)
          : null;
        const now = new Date();
        const hoursUntilDeadline = deadlineDate
          ? (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          : null;

        return {
          id: project._id,
          name: project.name,
          order: index + 1, // Add order based on array position
          // Only include deadline if within 48 hours
          ...(hoursUntilDeadline &&
            hoursUntilDeadline <= 48 && {
              deadline: project.deadline,
            }),
          tasks: project.tasks
            .filter((task) => !task.completed) // Filter out completed tasks
            .map((task, taskIndex) => ({
              id: task._id,
              name: task.name,
              duration: Number(task.duration),
              sequence: taskIndex, // Add sequence number based on array position
            })),
        };
      })
      // Sort by order field
      .sort((a, b) => a.order - b.order);

    let hasError = false;

    let generationType = "";
    let currentSchedule = null;
    if (day?.blocks && day.blocks.length > 0) {
      // There is an existing schedule – update it.
      generationType = "update";
      currentSchedule = (isPreviewMode ? previewSchedule : day.blocks).filter(
        (block: Block) => block.status !== "complete"
      );
    } else if (!hasEnoughTime) {
      // Not enough data to fill a full day – use a default schedule.
      generationType = "default";
    } else {
      // Enough time and no existing schedule – generate the full backlog.
      generationType = "fullBacklog";
    }

    // Build a unified payload for the API.
    const payload = {
      type: generationType,
      dayId: day._id,
      userInput,
      startTime,
      endTime,
      currentSchedule, // May be null if not applicable
      eventBlocks: optimizedEvents,
      routineBlocks: optimizedRoutines,
      tasks: optimizedTasks,
      projects: optimizedProjects,
    };

    try {
      // Intent Analysis
      setGenerationProgress(10);
      setGenerationStatus("Analyzing your requirements...");

      // Keep regeneration logic as is
      console.log(previewSchedule);
      setGenerationProgress(30);
      setGenerationStatus("Regenerating schedule...");

      console.log(payload.type);
      const automatedSchedule = await fetch("/api/non-specific-full-backlog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
      });

      // Initialize a local schedule to accumulate partial data
      let localSchedule = {
        currentTime: new Date().toLocaleTimeString(),
        scheduleRationale: "",
        userStartTime: startTime,
        userEndTime: endTime,
        blocks: [] as any[], // or use your Block[] type
      };

      streamSchedule(automatedSchedule, localSchedule);
      setGenerationProgress(100);
      setGenerationStatus("Schedule generated successfully!");
      console.log("Final streaming schedule:", localSchedule);

      setGenerationProgress(100);
      setGenerationStatus("Schedule generated successfully!");
    } catch (error) {
      hasError = true;
      console.error("Error in schedule generation process:", error);
      toast.error(
        "Failed to generate schedule. Try again with your last input."
      );
      setIsDialogOpen(true);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsGeneratingSchedule(false);
      setGenerationProgress(0);
      setGenerationStatus("");
      abortControllerRef.current = null;
      if (!hasError) {
        setLastGenerationInput(null); // Clear the input only on success
      }
    }
  };

  const handleCompleteBlock = async (blockId: string) => {
    console.log("Completing block:", blockId);
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "complete" }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete block");
      }

      const { updatedBlock } = await response.json();

      // Construct the updated day with the new block
      const updatedDay = {
        ...day,
        blocks: day.blocks.map((block: { _id: string }) => {
          if (typeof block === "string") return block;
          return block._id === blockId ? updatedBlock : block;
        }),
      };

      // Update the local state immediately with the completed block
      mutate(
        (currentDay: Day) => {
          // Create new blocks array with the updated block
          const updatedBlocks = currentDay.blocks.map((block) => {
            if (typeof block === "string") return block;
            return block._id === blockId ? updatedBlock : block;
          });

          // Create new sorted blocks for active tab
          const newSortedBlocks = sortedBlocks.filter(
            (block) => block._id !== blockId
          );
          setSortedBlocks(newSortedBlocks);

          return {
            ...currentDay,
            blocks: updatedBlocks,
          };
        },
        false // Don't revalidate immediately
      );

      // Show success message
      toast.success("Block completed successfully");

      // Finally, trigger a revalidation to ensure everything is in sync
      mutate();
    } catch (error) {
      console.error("Error completing block:", error);
      toast.error("Failed to complete block. Please try again.");
    }
  };

  const handleCompleteDay = async () => {
    try {
      const response = await fetch("/api/complete-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dayId: day._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete day");
      }

      // Update the local state
      mutate(
        (currentDay: any) => ({
          ...currentDay,
          completed: true,
        }),
        false
      );

      toast.success("Day completed successfully!");
    } catch (error) {
      console.error("Error completing day:", error);
      toast.error("Failed to complete day. Please try again.");
    }
  };

  const handleReactivateDay = async () => {
    try {
      const response = await fetch("/api/reactivate-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dayId: day._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate day");
      }

      // Update the local state
      mutate(
        (currentDay: any) => ({
          ...currentDay,
          completed: false,
        }),
        false
      );

      toast.success("Day reactivated successfully!");
    } catch (error) {
      console.error("Error reactivating day:", error);
      toast.error("Failed to reactivate day. Please try again.");
    }
  };

  const handleSaveBlock = async (updatedBlock: EditableBlockFields) => {
    console.log("Saving block:", updatedBlock);

    // Get allowed times for the day.
    const { startTime: dayStartTime, endTime: dayEndTime } =
      getScheduleTimes(selectedDay);

    // Validate the new times.
    const errorMessage = validateBlockTime(
      updatedBlock,
      day.blocks,
      dayStartTime,
      dayEndTime,
      updatedBlock._id
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const response = await fetch(`/api/blocks/${updatedBlock._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBlock),
      });

      if (!response.ok) {
        throw new Error("Failed to update block");
      }

      // Update the local state
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((block) => {
            if (typeof block === "string") return block;
            return block._id === updatedBlock._id ? updatedBlock : block;
          }),
        }),
        false
      );
    } catch (error) {
      console.error("Error updating block:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleReactivateBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}/reactivate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate block");
      }

      const block = await response.json();
      const updatedBlock = block.block;

      // Construct the updated day with the reactivated block
      const updatedDay = {
        ...day,
        blocks: day.blocks.map((block: { _id: string }) => {
          if (typeof block === "string") return block;
          return block._id === blockId ? updatedBlock : block;
        }),
      };

      // Update the local state
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((b) => {
            if (typeof b === "string" || b._id !== blockId) return b;
            return { ...b, status: "pending" };
          }),
        }),
        false
      );

      // Optionally, show a success message
      toast.success("Block reactivated successfully");
    } catch (error) {
      console.error("Error reactivating block:", error);
      toast.error("Failed to reactivate block. Please try again.");
    }
  };

  // With this:
  const allBlocksCompleted = day?.blocks
    ? day.blocks.length > 0 &&
      day.blocks.every(
        (block: { status: string }) => block.status === "complete"
      )
    : false;

  // Calculate completion rates
  const calculateTaskCompletionRate = (blocks: Block[]) => {
    let totalTasks = 0;
    let completedTasks = 0;
    blocks.forEach((block) => {
      if (block.tasks) {
        totalTasks += block.tasks.length;
        completedTasks += block.tasks.filter((task) => task.completed).length;
      }
    });
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const calculateBlockCompletionRate = (blocks: Block[]) => {
    return (
      (blocks.filter((block) => block.status === "complete").length /
        blocks.length) *
      100
    );
  };

  const handleGenerateSchedule = async () => {
    // const activeBlocks = sortedBlocks.filter(
    //   (block) => block.status === "pending"
    // );
    // if (activeBlocks.length > 0) {
    //   toast.error("There are too many blocks");
    //   // toast.error(
    //   //   <div className="flex flex-col gap-2">
    //   //     <p>
    //   //       Please complete or delete all active blocks before generating a new
    //   //       schedule.
    //   //     </p>
    //   //     <p className="text-sm text-muted-foreground">
    //   //       You have {activeBlocks.length} active block
    //   //       {activeBlocks.length > 1 ? "s" : ""} remaining.
    //   //     </p>
    //   //   </div>,
    //   //   {
    //   //     duration: 5000,
    //   //     position: "top-center",
    //   //   }
    //   // );
    //   return;
    // }

    console.log(day);

    setIsDialogOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // // Updated onDragStart handler with correct block property
  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragData;

    if (dragData?.task) {
      setActiveTask(dragData.task);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (!day?.blocks) return;

    try {
      const response = await fetch("/api/drag-end", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: day.blocks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      console.log(response);
    } catch (error) {
      console.error("Error updating task positions:", error);
      toast.error("Failed to save changes");
      // Optionally refresh to ensure DB consistency
      mutate();
    }
  };

  // Add this inside your Component, before the return statement

  const onDragOver = (event: DragOverEvent) => {
    console.log("DragOver Event started:", event);
    const { active, over } = event;
    if (!over || !day?.blocks) {
      console.log("No over element found");
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current as DragData;

    const isActiveTask = activeData?.type === "Task";
    const isOverTask = overData?.type === "Task";
    const isOverBlock = overData?.type === "Block";

    const activeTask = activeData?.task;
    if (!activeTask) return;

    // Get the block ID from either block or blockId field
    const getBlockId = (task: any) => task.block || task.blockId;
    const activeBlockId = getBlockId(activeTask);

    if (isActiveTask && isOverTask) {
      console.log("is active and over tasks");
      const overTask = overData?.task;
      if (!overTask) return;

      const overBlockId = getBlockId(overTask);

      const activeBlock = day.blocks.find(
        (block: { _id: any }) => block._id === activeBlockId
      );
      console.log("Active Block ID:", activeBlockId);
      console.log("Active Block:", activeBlock);

      const overBlock = day.blocks.find(
        (block: { _id: any }) => block._id === overBlockId
      );
      console.log("Over Block ID:", overBlockId);
      console.log("Over Block:", overBlock);

      if (!activeBlock || !overBlock) return;

      if (activeBlock._id === overBlock._id) {
        const oldIndex = activeBlock.tasks.findIndex(
          (task: { _id: string }) => task._id === activeTask._id
        );
        const newIndex = activeBlock.tasks.findIndex(
          (task: { _id: string }) => task._id === overTask._id
        );

        if (oldIndex === -1 || newIndex === -1) return;
        console.log("going to update task now.");

        processUpdate((currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((block) => {
            if (typeof block === "string" || block._id !== activeBlock._id)
              return block;

            const newTasks = [...block.tasks];
            const [movedTask] = newTasks.splice(oldIndex, 1);
            // Ensure the task has both block and blockId set correctly
            const updatedMovedTask = {
              ...movedTask,
              block: block._id,
              blockId: block._id,
            };
            newTasks.splice(newIndex, 0, updatedMovedTask);

            return {
              ...block,
              tasks: newTasks,
            };
          }),
        }));
      } else {
        const updatedTask = activeTask as any; // Most aggressive bypass
        updatedTask.block = overBlock._id;
        updatedTask.blockId = overBlock._id;

        processUpdate((currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((block) => {
            if (typeof block === "string") return block;

            if (block._id === activeBlock._id) {
              return {
                ...block,
                tasks: block.tasks.filter(
                  (task) => task._id !== activeTask._id
                ),
              };
            }

            if (block._id === overBlock._id) {
              const newTasks = [...block.tasks];
              const insertIndex = newTasks.findIndex(
                (task) => task._id === overTask._id
              );
              newTasks.splice(insertIndex, 0, updatedTask);

              return {
                ...block,
                tasks: newTasks,
              };
            }

            return block;
          }),
        }));
      }
    }

    if (isActiveTask && isOverBlock) {
      const overBlock = overData?.block;
      if (!overBlock) return;

      const activeBlock = day.blocks.find(
        (block: { _id: any }) => block._id === activeBlockId
      );
      if (!activeBlock || activeBlock._id === overBlock._id) return;

      const updatedTask = {
        ...activeTask,
        block: overBlock._id,
        blockId: overBlock._id, // Set both to ensure consistency
      };

      console.log("going to update task now");

      processUpdate((currentDay: Day) => ({
        ...currentDay,
        blocks: currentDay.blocks.map((block) => {
          if (typeof block === "string") return block;

          if (block._id === activeBlock._id) {
            return {
              ...block,
              tasks: block.tasks.filter((task) => task._id !== activeTask._id),
            };
          }

          if (block._id === overBlock._id) {
            return {
              ...block,
              tasks: [...block.tasks, updatedTask],
            };
          }

          return block;
        }),
      }));
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>
      {isLoading ? (
        <LoadingSpinner />
      ) : isGeneratingSchedule ? (
        <ScheduleGenerationSpinner
          progress={generationProgress}
          status={generationStatus}
        />
      ) : isPreviewMode && previewSchedule ? (
        <SchedulePreview
          schedule={previewSchedule}
          dayId={day?._id}
          userId={user?._id}
          mutate={mutate}
          onGenerateSchedule={() => setIsDialogOpen(true)} // Add this prop
        />
      ) : !day ? (
        <div className="flex h-screen w-full">
          <LoadingSpinner />
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden px-4 py-2 border-b border-gray-200">
            {/* Three column layout */}
            <div className="flex items-center justify-between">
              {/* Left: Menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <MobileNav />
                </SheetContent>
              </Sheet>

              {/* Center: Date selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-2 px-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatShortDate(currentDate)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => handleDayChange("today")}>
                    Today ({formatShortDate(today)})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDayChange("tomorrow")}>
                    Tomorrow ({formatShortDate(tomorrow)})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Right: User button */}
              <UserButton />
            </div>
          </div>

          <div className="p-4 md:px-8 md:pt-8">
            <div className="hidden md:block mb-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">
                    {formatDate(currentDate)}
                  </h1>
                  {/* <p className="text-sm text-gray-500">Alex James</p> */}
                </div>
                <div className="flex items-center gap-4">
                  {/* Desktop Date Selector */}
                  <Tabs
                    value={selectedDay}
                    onValueChange={(value) =>
                      setContextSelectedDay(value as "today" | "tomorrow")
                    }
                    className="border border-gray-200 rounded-lg"
                  >
                    <TabsList className="h-9 bg-transparent">
                      <TabsTrigger
                        value="today"
                        className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-l-md"
                      >
                        Today
                      </TabsTrigger>
                      <TabsTrigger
                        value="tomorrow"
                        className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-r-md"
                      >
                        Tomorrow
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <UserButton />
                </div>
              </div>
            </div>

            {day.completed ? (
              <CompletedDayView
                completedBlocks={day.blocks}
                taskCompletionRate={calculateTaskCompletionRate(day.blocks)}
                blockCompletionRate={calculateBlockCompletionRate(day.blocks)}
                onReactivateDay={handleReactivateDay}
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      className={`text-sm font-medium pb-1 border-b-2 ${
                        activeTab === "active"
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-blue-600 transition-colors"
                      }`}
                      onClick={() => setActiveTab("active")}
                    >
                      Active
                    </button>
                    <button
                      className={`text-sm font-medium pb-1 border-b-2 ${
                        activeTab === "completed"
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-blue-600 transition-colors"
                      }`}
                      onClick={() => setActiveTab("completed")}
                    >
                      Completed
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={OpenNewBlockModal}
                    >
                      <Plus className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">New Block</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={OpenNewEventModal}
                    >
                      <Clock className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Add Event</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={OpenNewRoutineModal}
                    >
                      <Repeat className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Add Routine</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 md:bg-blue-600 md:hover:bg-blue-700 md:text-white border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 transition-all md:border-transparent"
                      onClick={handleGenerateSchedule}
                    >
                      <Sparkles className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">
                        Generate Schedule
                      </span>
                    </Button>
                  </div>
                </div>
                <Separator className="mb-6" />
                {day.blocks.length === 0 ? (
                  <NoBlocksCard
                    activeTab={activeTab}
                    onGenerateSchedule={handleGenerateSchedule}
                    onAddBlock={() => setIsAddBlockDialogOpen(true)}
                    onAddEvent={() => setIsAddEventModalOpen(true)}
                    onAddRoutine={() => setIsAddRoutineModalOpen(true)}
                    onTemplateSelect={handleTemplateSelect}
                  />
                ) : activeTab === "completed" ? (
                  <div className="space-y-4">
                    {sortedBlocks.map((block) => (
                      <CompletedBlock
                        key={block._id}
                        block={block}
                        onReactivateBlock={(blockId) =>
                          handleReactivateBlock(blockId)
                        }
                      />
                    ))}
                  </div>
                ) : allBlocksCompleted ? (
                  <AllBlocksCompleted
                    onCompleteDay={handleCompleteDay}
                    onAddNewBlock={() => setIsAddBlockDialogOpen(true)}
                    blocks={day.blocks.filter(
                      (block: { status: string }) =>
                        typeof block !== "string" && block.status === "complete"
                    )}
                  />
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <div className="space-y-4">
                      {sortedBlocks.map((block: Block) => (
                        <TimeBlock
                          key={block._id}
                          block={block}
                          onDeleteBlock={handleDeleteBlock}
                          onEditBlock={(block) => {
                            setSelectedBlock(block);
                            setIsEditBlockDialogOpen(true);
                          }}
                          onAddTask={(blockId) => handleAddTask(blockId)}
                          onCompleteBlock={handleCompleteBlock}
                          onTaskCompletion={handleTaskCompletion}
                          onEditTask={handleEditTask}
                          onRemoveTask={handleRemoveTaskFromBlock}
                          onDeleteTask={handleDeleteTask}
                          updatingTasks={updatingTasks}
                          updatingTaskId={updatingTaskId}
                          onStartFocusSession={(block) =>
                            setFocusSessionBlock(block)
                          }
                        />
                        // <Card
                        //   key={block._id}
                        //   className="border-gray-200 shadow-sm"
                        // >
                        //   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        //     <CardTitle className="text-base font-medium flex-1">
                        //       <div className="flex items-center gap-2">
                        //         {block.name}
                        //         {block.isStandaloneBlock && (
                        //           <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        //             <Sparkles className="mr-1 h-3 w-3" />
                        //             <span className="hidden sm:inline">
                        //               AI Optimized
                        //             </span>
                        //           </span>
                        //         )}
                        //         <TooltipProvider>
                        //           <Tooltip>
                        //             <TooltipTrigger>
                        //               <Info className="h-4 w-4 text-gray-400" />
                        //             </TooltipTrigger>
                        //             <TooltipContent>
                        //               <p className="max-w-xs">
                        //                 {block.description}
                        //               </p>
                        //             </TooltipContent>
                        //           </Tooltip>
                        //         </TooltipProvider>
                        //         <BlockProgress tasks={block.tasks} />
                        //       </div>
                        //     </CardTitle>
                        //     <div className="flex items-center space-x-2">
                        //       <div className="hidden md:flex items-center text-sm text-gray-500">
                        //         <Clock className="mr-1.5 h-3.5 w-3.5" />
                        //         {block.startTime} - {block.endTime}
                        //       </div>

                        //       <DropdownMenu modal={false}>
                        //         <DropdownMenuTrigger asChild>
                        //           <Button
                        //             variant="ghost"
                        //             size="icon"
                        //             className="h-8 w-8 p-0"
                        //           >
                        //             <MoreVertical className="h-4 w-4" />
                        //           </Button>
                        //         </DropdownMenuTrigger>
                        //         <DropdownMenuContent align="end">
                        //           <DropdownMenuItem className="md:hidden">
                        //             <Clock className="mr-2 h-4 w-4" />
                        //             <span>
                        //               {block.startTime} - {block.endTime}
                        //             </span>
                        //           </DropdownMenuItem>
                        //           <DropdownMenuItem
                        //             onSelect={(e) => {
                        //               e.preventDefault();
                        //               setSelectedBlock(block);
                        //               setIsEditBlockDialogOpen(true);
                        //             }}
                        //           >
                        //             <Edit className="mr-2 h-4 w-4" />
                        //             <span>Edit Block</span>
                        //           </DropdownMenuItem>
                        //           <DropdownMenuItem
                        //             onClick={() => handleDeleteBlock(block)}
                        //           >
                        //             <Trash2 className="mr-2 h-4 w-4" />
                        //             <span>Delete Block</span>
                        //           </DropdownMenuItem>
                        //         </DropdownMenuContent>
                        //       </DropdownMenu>
                        //     </div>
                        //   </CardHeader>
                        //   <CardContent>
                        //     {block.tasks.map((task: Task) => (
                        //       <TaskCard
                        //         key={task._id}
                        //         task={task}
                        //         block={block}
                        //         updatingTasks={updatingTasks}
                        //         updatingTaskId={updatingTaskId}
                        //         onTaskCompletion={handleTaskCompletion}
                        //         onEditTask={(task) => {
                        //           setEditingTask(task);
                        //           setIsEditDialogOpen(true);
                        //         }}
                        //         onRemoveTask={handleRemoveTaskFromBlock}
                        //         onDeleteTask={handleDeleteTask}
                        //       />
                        //     ))}
                        //     <div className="flex justify-between items-center mt-4">
                        //       <Button
                        //         variant="outline"
                        //         size="sm"
                        //         className="h-8 text-sm"
                        //         onClick={() => handleAddTask(block._id)}
                        //       >
                        //         <Plus className="h-4 w-4 mr-1" />
                        //         Add Task
                        //       </Button>
                        //       <div className="space-x-2">
                        //         <Button
                        //           variant="outline"
                        //           size="sm"
                        //           className="h-8 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
                        //           onClick={() => handleCompleteBlock(block._id)}
                        //         >
                        //           <Check className="h-4 w-4 md:mr-1" />
                        //           <span className="hidden md:inline">
                        //             Complete
                        //           </span>
                        //         </Button>
                        //         {block.meetingLink ? (
                        //           <Button
                        //             variant="outline"
                        //             size="sm"
                        //             className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        //             asChild
                        //           >
                        //             <a
                        //               href={block.meetingLink}
                        //               target="_blank"
                        //               rel="noopener noreferrer"
                        //               className="flex items-center"
                        //             >
                        //               <LinkIcon className="h-4 w-4 md:mr-1" />
                        //               <span className="hidden md:inline">
                        //                 Join Meeting
                        //               </span>
                        //             </a>
                        //           </Button>
                        //         ) : (
                        //           <Button
                        //             variant="outline"
                        //             size="sm"
                        //             className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        //             onClick={() => setFocusSessionBlock(block)}
                        //           >
                        //             <Clock className="h-4 w-4 md:mr-1" />
                        //             <span className="hidden md:inline">
                        //               Start
                        //             </span>
                        //           </Button>
                        //         )}
                        //       </div>
                        //     </div>
                        //   </CardContent>
                        // </Card>
                      ))}
                    </div>
                    {activeTask &&
                      createPortal(
                        <DragOverlay>
                          <TaskCard
                            task={activeTask}
                            block={
                              sortedBlocks.find(
                                (block) => block._id === activeTask.block
                              ) || sortedBlocks[0]
                            } // Provide a fallback block
                            updatingTasks={updatingTasks}
                            updatingTaskId={updatingTaskId}
                            onTaskCompletion={handleTaskCompletion}
                            onEditTask={handleEditTask}
                            onRemoveTask={handleRemoveTaskFromBlock}
                            onDeleteTask={handleDeleteTask}
                          />
                        </DragOverlay>,
                        document.body
                      )}
                  </DndContext>
                )}
              </>
            )}
          </div>
        </main>
      )}
      <ScheduleGenerationDialog
        isOpen={isDialogOpen}
        onClose={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedTemplate(null); // Reset the selected template when drawer closes
          }
        }}
        onGenerateSchedule={(userInput: string) =>
          generateScheduleTest(userInput)
        }
        isPreviewMode={isPreviewMode}
        initialPromptPoints={selectedTemplate?.promptPoints}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={updateDay}
      />
      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={updateDay}
      />
      <AddBlockDialog
        isOpen={isAddBlockDialogOpen}
        onOpenChange={setIsAddBlockDialogOpen}
        onAddBlock={handleAddBlock}
      />
      {isAddTaskModalOpen && day && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAddTask={handleAddTaskToBlock}
          blockId={selectedBlockId && selectedBlockId}
          updateDay={updateDay}
          day={day}
          isCustomDuration={false}
        />
      )}
      {/* Then, add this Dialog component outside of the task card, at the same level as other dialogs */}
      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={(open) => {
          setIsEditTaskDialogOpen(open);
          if (!open) {
            setSelectedTask(null);
          }
        }}
      >
        {selectedTask && (
          <DialogContent>
            <EditTaskDialog
              task={selectedTask}
              onClose={() => setIsEditTaskDialogOpen(false)}
              onSave={async (updatedTask) => {
                await handleSaveTask(updatedTask);
                setIsEditTaskDialogOpen(false);
              }}
            />
          </DialogContent>
        )}
      </Dialog>
      {/* Edit Block Dialog */}
      <Dialog
        open={isEditBlockDialogOpen}
        onOpenChange={(open) => {
          setIsEditBlockDialogOpen(open);
          if (!open) {
            setSelectedBlock(null);
          }
        }}
      >
        {selectedBlock && (
          <DialogContent>
            <EditBlockDialog
              block={selectedBlock}
              onClose={() => setIsEditBlockDialogOpen(false)}
              onSave={async (updatedBlock) => {
                await handleSaveBlock(updatedBlock);
                setIsEditBlockDialogOpen(false);
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      {focusSessionBlock && (
        <FocusSession
          block={focusSessionBlock}
          onClose={() => setFocusSessionBlock(null)}
        />
      )}
    </div>
  );
}
