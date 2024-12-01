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
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { useAuth } from "@clerk/nextjs";

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

interface Block {
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
}

export default function Component() {
  const [selectedDay, setSelectedDay] = React.useState<"today" | "tomorrow">(
    "today"
  );
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
  } = useAppContext();
  const [hasProcessedPrompt, setHasProcessedPrompt] = useState(false);
  const { user, day, mutate, isError } = useUserAndDay();
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortedBlocks, setSortedBlocks] = useState<Block[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const currentDate = selectedDay === "today" ? today : tomorrow;

  useEffect(() => {
    if (day && day.blocks) {
      const sorted = [...day.blocks]
        .filter((block: Block) => block.status !== "complete")
        .sort((a: Block, b: Block) => {
          const timeA = a.startTime
            ? new Date(`1970-01-01T${a.startTime}:00`)
            : new Date(0);
          const timeB = b.startTime
            ? new Date(`1970-01-01T${b.startTime}:00`)
            : new Date(0);
          return timeA.getTime() - timeB.getTime();
        });
      setSortedBlocks(sorted);
    }
  }, [day]);

  useEffect(() => {
    // Only run if we have a promptText and haven't processed it yet
    if (promptText && !hasProcessedPrompt) {
      const generateSchedule = async () => {
        setIsLoading(true);
        try {
          const intentResponse = await fetch("/api/home-page-intent-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userInput: promptText,
              startTime: "09:00",
              endTime: "17:00",
            }),
          });

          const intentAnalysis = await intentResponse.json();
          const endpoint = intentAnalysis.isSpecificRequest
            ? "/api/home-page-specific"
            : "/api/home-page-non-specific";

          const scheduleResponse = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userInput: promptText,
              startTime: "09:00",
              endTime: "17:00",
            }),
          });

          const schedule = await scheduleResponse.json();

          if (schedule.blocks) {
            setPreviewSchedule(schedule);
            setIsPreviewMode(true);
          }
        } catch (error) {
          console.error("Failed to generate schedule:", error);
        } finally {
          setIsLoading(false);
          setHasProcessedPrompt(true); // Mark that we've processed this prompt
          setPromptText(""); // Clear the prompt after processing
        }
      };

      generateSchedule();
    }
  }, [promptText]);

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

  // Modify handleSaveBlock to use mutate without manual sorting
  const handleSaveBlock = async (updatedBlock: Block) => {
    console.log("Saving block:", updatedBlock);
    try {
      const response = await fetch(`/api/blocks/${updatedBlock._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBlock),
      });
      console.log("response", response);
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

  // Add this handler where you open the edit dialog:
  const handleEditTask = (task: Task) => {
    console.log(task);
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleAddBlock = async (newBlock: {
    name: any;
    startTime: any;
    endTime: any;
  }) => {
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

  const generateScheduleTest = async (
    userInput: string,
    startTime: string,
    endTime: string
  ) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setIsDialogOpen(false);
    // setGenerationProgress(0);
    // setGenerationStep("Initializing...");

    // console.log("Projects:", projects);
    // console.log("Original Tasks:", tasks);
    // console.log("Routines:", routines);
    // console.log("Events:", events);
    console.log(userInput, startTime, endTime);

    // Get the date and day of the week from the state
    const selectedDate = new Date(day.date);
    const formattedSelectedDate = selectedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const selectedDayOfWeek = selectedDate.toLocaleString("en-us", {
      weekday: "long",
    });

    console.log("Selected Date:", formattedSelectedDate);
    console.log("Selected Day of Week:", selectedDayOfWeek);

    // Filter out completed standalone tasks
    const incompleteTasks = tasks.filter(
      (task) => !task.isRoutineTask && !task.completed
    );

    // Filter out completed tasks from projects
    const projectsWithIncompleteTasks = projects.map((project) => ({
      ...project,
      tasks: project.tasks.filter((task) => !task.completed),
    }));

    // Optimize tasks
    const optimizedTasks = incompleteTasks.map((task) => {
      const { name, description, duration, priority, deadline } = task;
      const sanitizedDescription = description.trim().replace(/\n/g, " ");
      const parsedDuration = Number(duration);

      return {
        name,
        description: sanitizedDescription,
        duration: parsedDuration,
        priority,
        ...(deadline && !isNaN(Date.parse(deadline)) && { deadline }),
      };
    });

    // Filter and optimize events
    const optimizedEvents = events
      .filter((event) => {
        console.log("Checking event:", event.name);

        // Check if the event is for the selected date
        if (event.date) {
          const eventDate = new Date(event.date).toISOString().split("T")[0];
          console.log(
            "Event date:",
            eventDate,
            "Selected date:",
            formattedSelectedDate
          );
          if (eventDate === formattedSelectedDate) {
            console.log("Date match");
            return true;
          }
        }

        // Check if it's a recurring event for the selected day of the week
        if (
          event.isRecurring &&
          event.days &&
          event.days.includes(selectedDayOfWeek)
        ) {
          console.log("Recurring event match");
          return true;
        }

        console.log("No match");
        return false;
      })
      .map((event) => {
        const { name, description, startTime, endTime } = event;
        const sanitizedDescription = description.trim().replace(/\n/g, " ");

        return {
          name,
          description: sanitizedDescription,
          startTime,
          endTime,
        };
      });

    // Filter and optimize routines
    const optimizedRoutines = routines
      .filter((routine) => routine.days.includes(selectedDayOfWeek))
      .map((routine) => ({
        name: routine.name,
        description: routine.description,
        tasks: routine.tasks.map((task) => ({
          name: task.name,
          description: task.description,
          duration: Number(task.duration),
          priority: task.priority,
        })),
      }));

    const optimizedProjects = projectsWithIncompleteTasks.map((project) => ({
      id: project._id,
      name: project.name,
      description: project.description,
      deadline: project.deadline,
      priority: project.priority,
      tasks: project.tasks.map((task) => ({
        id: task._id,
        name: task.name,
        description: task.description,
        completed: task.completed,
        priority: task.priority,
        duration: Number(task.duration),
        projectId: project._id,
        deadline: task.deadline,
      })),
    }));

    console.log("Optimized Projects:", optimizedProjects);
    console.log("Optimized Tasks:", optimizedTasks);
    console.log("Optimized Events:", optimizedEvents);
    console.log("Optimized Routines:", optimizedRoutines);

    try {
      // Initial setup
      // setGenerationProgress(5);
      // setGenerationStep("Preparing data for analysis...");

      if (isPreviewMode) {
        // setGenerationProgress(20);
        // setGenerationStep("Analyzing intent and requirements...");
        const regeneratedSchedule = await fetch("/api/regenerate-schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            previewSchedule: previewSchedule,
            projects: optimizedProjects,
            eventBlocks: events,
            routineBlocks: routines,
            tasks: optimizedTasks,
            userInput: userInput,
            startTime: startTime,
            endTime: endTime,
          }),
          signal, // Add abort signal
        });
        // After first API response
        // setGenerationProgress(40);
        // setGenerationStep("Processing schedule structure...");
        const regeneratedScedhuleJson = await regeneratedSchedule.json();
        console.log(regeneratedScedhuleJson);
        if (regeneratedScedhuleJson.blocks) {
          setPreviewSchedule(regeneratedScedhuleJson);
          setIsPreviewMode(true);
        }
      } else {
        // First API call
        // setGenerationProgress(20);
        // setGenerationStep("Analyzing intent and requirements...");
        const baseSchedule = await fetch("/api/intent-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projects: optimizedProjects,
            eventBlocks: optimizedEvents,
            routineBlocks: optimizedRoutines,
            tasks: optimizedTasks,
            userInput: userInput,
            startTime: startTime,
            endTime: endTime,
          }),
          signal, // Add abort signal
        });
        // After first API response
        // setGenerationProgress(40);
        // setGenerationStep("Processing schedule structure...");
        const baseSchedulejson = await baseSchedule.json();
        console.log("Generated Initial Schedule:", baseSchedulejson);
        console.log(
          baseSchedulejson.hasEnoughData === false &&
            baseSchedulejson.hasSpecificInstructions
        );

        if (
          baseSchedulejson.hasEnoughData === false &&
          baseSchedulejson.hasSpecificInstructions === false
        ) {
          console.log("running the default schedule");
          // setGenerationProgress(60);
          // setGenerationStep("Generating default schedule...");
          const defaultScedhule = await fetch("/api/default-schedule", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projects: optimizedProjects,
              eventBlocks: events,
              routineBlocks: routines,
              tasks: optimizedTasks,
              userInput: userInput,
              startTime: startTime,
              endTime: endTime,
            }),
            signal, // Add abort signal
          });
          // setGenerationProgress(80);
          // setGenerationStep("Finalizing schedule...");

          const defaultScedhuleJson = await defaultScedhule.json();
          console.log(defaultScedhuleJson);

          if (defaultScedhuleJson.blocks) {
            // setGenerationProgress(90);
            // setGenerationStep("Preparing preview...");
            setPreviewSchedule(defaultScedhuleJson);
            setIsPreviewMode(true);
          }
        }

        if (
          baseSchedulejson.hasEnoughData === false &&
          baseSchedulejson.hasSpecificInstructions === true
        ) {
          console.log("running the specific schedule");
          // setGenerationProgress(60);
          // setGenerationStep("Generating Specific schedule...");
          const userSpecificScedhule = await fetch(
            "/api/user-specific-prompt",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projects: optimizedProjects,
                eventBlocks: events,
                routineBlocks: routines,
                tasks: optimizedTasks,
                userInput: userInput,
                startTime: startTime,
                endTime: endTime,
              }),
              signal, // Add abort signal
            }
          );
          // setGenerationProgress(80);
          // setGenerationStep("Finalizing schedule...");
          const userSpecificScedhuleJson = await userSpecificScedhule.json();
          console.log(userSpecificScedhuleJson);
          if (userSpecificScedhuleJson.blocks) {
            // setGenerationProgress(90);
            // setGenerationStep("Preparing preview...");
            setPreviewSchedule(userSpecificScedhuleJson);
            setIsPreviewMode(true);
          }
        }

        if (
          baseSchedulejson.hasEnoughData === true &&
          baseSchedulejson.hasSpecificInstructions === false
        ) {
          // setGenerationProgress(60);
          // setGenerationStep("Generating default schedule...");
          console.log("running the fully automated schedule generation");
          const automatedSchedule = await fetch(
            "/api/non-specific-full-backlog",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projects: optimizedProjects,
                eventBlocks: events,
                routineBlocks: routines,
                tasks: optimizedTasks,
                userInput: userInput,
                startTime: startTime,
                endTime: endTime,
              }),
              signal, // Add abort signal
            }
          );
          // setGenerationProgress(80);
          // setGenerationStep("Finalizing schedule...");
          const automatedScheduleJson = await automatedSchedule.json();
          console.log(automatedScheduleJson);
          if (automatedScheduleJson.blocks) {
            // setGenerationProgress(90);
            // setGenerationStep("Preparing preview...");
            setPreviewSchedule(automatedScheduleJson);
            setIsPreviewMode(true);
          }
        }

        if (
          baseSchedulejson.hasEnoughData === true &&
          baseSchedulejson.hasSpecificInstructions === true
        ) {
          console.log("running the specific schedule with full blocks");
          // setGenerationProgress(60);
          // setGenerationStep("Generating specific schedule...");
          const userSpecificFullBacklog = await fetch(
            "/api/specific-full-backlog",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projects: optimizedProjects,
                eventBlocks: events,
                routineBlocks: routines,
                tasks: optimizedTasks,
                userInput: userInput,
                startTime: startTime,
                endTime: endTime,
              }),
              signal, // Add abort signal
            }
          );
          // setGenerationProgress(80);
          // setGenerationStep("Finalizing schedule...");
          const userSpecificFullBacklogJson =
            await userSpecificFullBacklog.json();
          console.log(userSpecificFullBacklogJson);
          if (userSpecificFullBacklogJson.blocks) {
            // setGenerationProgress(90);
            // setGenerationStep("Preparing preview...");
            setPreviewSchedule(userSpecificFullBacklogJson);
            setIsPreviewMode(true);
          }
        }

        // const response = await fetch("/api/generate-schedule-test", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     baseSchedulejson: baseSchedulejson,
        //     userInput: userInput,
        //     startTime: startTime,
        //     endTime: endTime,
        //     eventBlocks: optimizedEvents,
        //     routineBlocks: optimizedRoutines,
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to generate initial schedule");
        // }

        // const generatedSchedule = await response.json();
        // console.log("Generated Initial Schedule:", generatedSchedule);

        // // New API call to generate-schedule-add-tasks
        // const taskIntegrationResponse = await fetch(
        //   "/api/generate-schedule-add-tasks",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       generatedSchedule: generatedSchedule,
        //       userInput: userInput,
        //       startTime: startTime,
        //       endTime: endTime,
        //       projects: optimizedProjects,
        //       standaloneTasks: optimizedTasks,
        //     }),
        //   }
        // );

        // if (!taskIntegrationResponse.ok) {
        //   throw new Error("Failed to integrate tasks into schedule");
        // }

        // const finalSchedule = await taskIntegrationResponse.json();
        // console.log("Final Schedule with Integrated Tasks:", finalSchedule);

        // console.log("Optimizing schedule for flow and productivity...");

        // // New API call to optimize for flow and productivity
        // const flowOptimizationResponse = await fetch(
        //   "/api/optimize-schedule-flow",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       currentSchedule: finalSchedule,
        //       userPreferences: {
        //         peakProductivityHours: ["09:00", "14:00"], // Example data, adjust as needed
        //         preferredWorkPattern: "longer focused sessions",
        //       },
        //     }),
        //   }
        // );

        // if (!flowOptimizationResponse.ok) {
        //   throw new Error("Failed to optimize schedule for flow");
        // }

        // const optimizedSchedule = await flowOptimizationResponse.json();
        // console.log("Flow-Optimized Schedule:", optimizedSchedule);

        // // Here you can update your state or perform any other actions with the final schedule
        // // For example:
        // // setSchedule(finalSchedule);
      }

      // setGenerationProgress(100);
      // setGenerationStep("Schedule generated successfully!");
    } catch (error) {
      console.error("Error in schedule generation process:", error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
      // setGenerationProgress(0);
      abortControllerRef.current = null;
    }
  };

  const handleGenerateSchedule = async () => {
    const activeBlocks = sortedBlocks.filter(
      (block) => block.status === "pending"
    );
    if (activeBlocks.length > 0) {
      console.log("there are too many blocks");
      alert("There are too many blocks");
      // toast.error(
      //   <div className="flex flex-col gap-2">
      //     <p>
      //       Please complete or delete all active blocks before generating a new
      //       schedule.
      //     </p>
      //     <p className="text-sm text-muted-foreground">
      //       You have {activeBlocks.length} active block
      //       {activeBlocks.length > 1 ? "s" : ""} remaining.
      //     </p>
      //   </div>,
      //   {
      //     duration: 5000,
      //     position: "top-center",
      //   }
      // );
      return;
    }

    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>
      {isLoading ? (
        <LoadingSpinner />
      ) : isPreviewMode && previewSchedule ? (
        <SchedulePreview
          schedule={previewSchedule}
          dayId={day?._id} // Use optional chaining
          userId={user?._id} // Use optional chaining
          mutate={mutate}
        />
      ) : (
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-16 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {formatShortDate(currentDate)}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedDay("today")}>
                  Today ({formatShortDate(today)})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDay("tomorrow")}>
                  Tomorrow ({formatShortDate(tomorrow)})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="p-4 md:px-8 md:pt-8">
            <div className="hidden md:block mb-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">Welcome back, Alex</h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(currentDate)}
                  </p>
                </div>
                <Tabs
                  value={selectedDay}
                  onValueChange={(value) =>
                    setSelectedDay(value as "today" | "tomorrow")
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
                {/* <UserButton /> */}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <button className="text-sm font-medium text-blue-600 pb-1 border-b-2 border-blue-600">
                  Active
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
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
                  <span className="hidden md:inline">Generate Schedule</span>
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Cards */}
            <div className="space-y-4">
              {sortedBlocks.map((block: Block) => (
                <Card key={block._id} className="border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      <div className="flex items-center gap-2">
                        {block.name}
                        {block.isStandaloneBlock && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI Optimized
                          </span>
                        )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Block</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBlock(block)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Block</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {block.tasks.map((task: Task) => (
                      <Card
                        key={task._id}
                        className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                            <Checkbox
                              id={`task-${task._id}`}
                              checked={task.completed}
                              onCheckedChange={(checked) =>
                                handleTaskCompletion(
                                  task._id,
                                  checked as boolean
                                )
                              }
                              className="flex-shrink-0 mt-0.5"
                              disabled={
                                updatingTasks && updatingTaskId === task._id
                              }
                            />

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <label
                                    htmlFor={`task-${task._id}`}
                                    className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                                  >
                                    {task.name}
                                  </label>
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                                    {task.duration}min
                                  </span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
                                          {task.type}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          {task.description}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="focus:outline-none">
                                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault(); // Prevent any default menu behavior
                                        handleEditTask(task);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRemoveTaskFromBlock(task, block)
                                      }
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      Remove from Block
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteTask(task, block)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <div
                          className={`absolute top-0 right-0 bottom-0 w-1 ${
                            task.priority === "High"
                              ? "bg-red-500"
                              : task.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          aria-label="Priority Indicator"
                        />
                      </Card>
                    ))}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm"
                        onClick={() => handleAddTask(block._id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <footer className="mt-8 pt-4 border-t border-gray-200 px-4 md:px-8">
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(new Date())}
            </p>
          </footer>
        </main>
      )}
      <ScheduleGenerationDialog
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        onGenerateSchedule={(
          userInput: string,
          startTime: string,
          endTime: string
        ) => generateScheduleTest(userInput, startTime, endTime)}
        isPreviewMode={false}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={() => {}}
      />
      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={() => {}}
      />
      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          isOpen={isEditTaskDialogOpen}
          onClose={() => setIsEditTaskDialogOpen(false)}
          onSave={handleSaveTask}
        />
      )}

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
        />
      )}
    </div>
  );
}
