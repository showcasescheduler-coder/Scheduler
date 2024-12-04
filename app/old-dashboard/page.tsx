"use client";
import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Block, Task, Day } from "@/app/context/models";
import { UserData } from "@/app/context/models";
import { AddTaskModal } from "@/dialog/addTaskModal";
import { AddEventModal } from "@/dialog/addEventModal";
import { AddRoutineModal } from "@/dialog/addRoutineModal";
import { ScheduleGenerationDialog } from "@/dialog/generateScheduleModal";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Truck,
  PlusCircle,
  CheckCircle,
  Clock,
  Star,
  GripVertical,
  CalendarClock,
  CalendarPlus,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  ChevronDown,
  RotateCcw,
  ClipboardList,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTodayDay } from "@/hooks/useTodayDay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import debounce from "lodash.debounce";
import { DebouncedFunc } from "lodash"; // Add
import { Loader2 } from "lucide-react"; // I
import { EditTaskDialog } from "@/dialog/editTaskModal";
import { EditBlockDialog } from "@/dialog/editBlockModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon, AlertCircle } from "lucide-react";
import { useUserAndDay } from "@/hooks/useUserAndDay";
import { useAuth } from "@clerk/nextjs";
import LoadingMessages from "@/app/components/MessgageSpinner"; // Add this import
import toast from "react-hot-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TimeBlock {
  description: string;
  startTime: string;
  endTime: string;
  Tasks: Task[];
}

interface ScheduleResponse {
  mainGoal: string;
  ObjectiveOne: string;
  ObjectiveTwo: string;
  Blocks: TimeBlock[];
}

interface PerformanceRating {
  level: PerformanceLevel;
  score: number;
  comment: string;
}

type PerformanceLevel =
  | "Preparing for Takeoff"
  | "Building Momentum"
  | "In the Zone"
  | "Peak Performance"
  | "Unstoppable";

const DashboardPage = () => {
  const {
    projects,
    events,
    routines,
    tasks,
    setEvents,
    setProjects,
    setRoutines,
    setTasks,
    blocks,
    setBlocks,
    setDay,
    selectedDay,
  } = useAppContext();
  const [aiResponse, setAiResponse] = useState<ScheduleResponse | null>(null);
  // const { day, isLoading, isError, mutate } = useTodayDay();
  const { user, day, isLoading, mutate, isError } = useUserAndDay();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  // Add these near the top of the component with other state declarations
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewSchedule, setpreviewSchedule] = useState({});
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>([]);
  const [previewScheduleRationale, setPreviewScheduleRationale] = useState<
    string | null
  >("");
  const [updatingTasks, setUpdatingTasks] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [performanceRating, setPerformanceRating] =
    useState<PerformanceRating | null>(null);
  const { isLoaded, userId } = useAuth();
  const [sortedBlocks, setSortedBlocks] = useState<Block[]>([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<string | null>(null);
  const [isGeneratingScheduleDialogOpen, setIsGeneratingScheduleDialogOpen] =
    useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const MINIMUM_TASKS_REQUIRED = 5; // Adjust this number as needed

  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const calculateCompletedTasksCount = (blocks: Block[]): number => {
    return blocks.reduce(
      (sum, block) =>
        sum + (block.tasks?.filter((task) => task.completed).length || 0),
      0
    );
  };

  const debouncedUpdateRef =
    useRef<
      DebouncedFunc<(taskId: string, completed: boolean) => Promise<void>>
    >();

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
        alert("Failed to fetch routines. Please try again.");
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
        alert("Failed to fetch tasks. Please try again.");
      }
    };

    fetchTasks();
  }, [setTasks]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getPerformanceRating = async (updatedDay: Day) => {
    if (
      !updatedDay ||
      !updatedDay.blocks ||
      !Array.isArray(updatedDay.blocks)
    ) {
      console.log("Invalid day object, skipping performance rating");
      return;
    }

    console.log("Getting performance rating...");
    console.log("this is the day send to the api", updatedDay);

    try {
      const response = await fetch("/api/getPerformanceRating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedDay }),
      });

      if (!response.ok) {
        throw new Error("Failed to get performance rating");
      }

      const rating = await response.json();

      // Update the day with the new performance rating
      const updateResponse = await fetch(`/api/days/${day._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ performanceRating: rating }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update day with performance rating");
      }

      // Update the local state immediately
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          performanceRating: rating,
        }),
        false
      );

      console.log("Performance rating:", rating);

      setPerformanceRating(rating);
      return rating;
    } catch (error) {
      console.error("Error getting performance rating:", error);
    }
  };

  const availableuserInformation = {
    name: "John Doe", // You might want to get this from your user context
    // date: day.date,
    projects: projects,
    stand_alone_tasks: tasks,
    routines: routines,
    events: events,
    // You might need to add historical_data if you have it in your app context
  };

  const calculateWeightedCompletion = (blocks: Block[]): number => {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return 0;

    // Block completion calculation (40% weight)
    const totalBlocks = blocks.length;
    const completedBlocks = blocks.filter(
      (block) => block.status === "complete"
    ).length;
    const blockCompletionRate =
      totalBlocks > 0 ? completedBlocks / totalBlocks : 0;

    // Task completion calculation (60% weight)
    let totalTasks = 0;
    let completedTasks = 0;
    blocks.forEach((block) => {
      if (block.tasks) {
        totalTasks += block.tasks.length;
        completedTasks += block.tasks.filter((task) => task.completed).length;
      }
    });
    const taskCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // Calculate weighted average (40% blocks, 60% tasks)
    const weightedCompletion =
      blockCompletionRate * 0.4 + taskCompletionRate * 0.6;
    return Math.round(weightedCompletion * 100);
  };

  const handleTaskCompletion = useCallback(
    async (taskId: string, completed: boolean) => {
      if (!day) return;
      setUpdatingTasks(true);
      setUpdatingTaskId(taskId);

      try {
        // Update task completion status
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
              if (typeof block === "string") {
                return block;
              }
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
    },
    [day, mutate]
  );

  // const handleTaskCompletion = useCallback(
  //   debounce(async (taskId: string, completed: boolean) => {
  //     if (!day) return;
  //     setUpdatingTasks(true);
  //     setUpdatingTaskId(taskId);

  //     try {
  //       let completedTaskCount = calculateCompletedTasksCount(day.blocks);
  //       completedTaskCount = completed
  //         ? completedTaskCount + 1
  //         : completedTaskCount - 1;

  //       console.log(completedTaskCount);
  //       console.log("Updating task completion status...");

  //       const response = await fetch(`/api/tasks/${taskId}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           completed,
  //           dayId: day._id,
  //           completedTasksCount: completedTaskCount,
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to update task completion status");
  //       }

  //       const { updatedTask, updatedDay } = await response.json();

  //       let newPerformanceRating: PerformanceRating;

  //       if (completedTaskCount === 0) {
  //         newPerformanceRating = {
  //           level: "Preparing for Takeoff",
  //           score: 0,
  //           comment:
  //             "No tasks completed yet. Start your day by completing some tasks!",
  //         };
  //       } else {
  //         // Only call the API if there are completed tasks
  //         const ratingResponse = await fetch("/api/getPerformanceRating", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ updatedDay }),
  //         });

  //         if (!ratingResponse.ok) {
  //           throw new Error("Failed to get performance rating");
  //         }

  //         newPerformanceRating = await ratingResponse.json();
  //       }
  //       console.log("newPerformanceRating", newPerformanceRating);

  //       // Update the day with the new performance rating
  //       const updateResponse = await fetch(`/api/days/${day._id}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ performanceRating: newPerformanceRating }),
  //       });

  //       if (!updateResponse.ok) {
  //         throw new Error("Failed to update day with performance rating");
  //       }

  //       // Update local state
  //       mutate(
  //         (currentDay: Day) => ({
  //           ...currentDay,
  //           completedTasksCount: updatedDay.completedTasksCount,
  //           performanceRating: newPerformanceRating,
  //           blocks: currentDay.blocks.map((block) => {
  //             if (typeof block === "string") {
  //               return block;
  //             }
  //             return {
  //               ...block,
  //               tasks: block.tasks.map((task) =>
  //                 task._id === taskId ? updatedTask : task
  //               ),
  //             };
  //           }),
  //         }),
  //         false
  //       );

  //       setPerformanceRating(newPerformanceRating);
  //     } catch (error) {
  //       console.error("Error updating task completion status:", error);
  //     } finally {
  //       setUpdatingTasks(false);
  //       setUpdatingTaskId(null);
  //     }
  //   }, 500),
  //   [day, calculateCompletedTasksCount, mutate]
  // );

  const hasPendingBlocks = day?.blocks.some(
    (block: Block) => block.status === "pending"
  );

  const handleGenerateSchedule = async () => {
    const activeBlocks = sortedBlocks.filter(
      (block) => block.status === "pending"
    );
    if (activeBlocks.length > 0) {
      toast.error(
        <div className="flex flex-col gap-2">
          <p>
            Please complete or delete all active blocks before generating a new
            schedule.
          </p>
          <p className="text-sm text-muted-foreground">
            You have {activeBlocks.length} active block
            {activeBlocks.length > 1 ? "s" : ""} remaining.
          </p>
        </div>,
        {
          duration: 5000,
          position: "top-center",
        }
      );
      return;
    }

    setIsGeneratingScheduleDialogOpen(true);
  };

  const handleDiscardPreview = () => {
    setIsPreviewMode(false);
    setPreviewBlocks([]);
    toast.success("Preview discarded");
  };

  const handleSaveGeneratedSchedule = async () => {
    console.log(previewSchedule);
    try {
      setIsGeneratingSchedule(true);
      // Send the parsed response to the scheduler route
      const schedulerResponse = await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayId: day._id,
          schedule: previewSchedule,
          userId: user._id,
        }),
      });

      if (!schedulerResponse.ok) {
        throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
      }

      const updatedDay = await schedulerResponse.json();
      console.log("Updated day:", updatedDay);

      // Update the local state or trigger a refetch of the day data
      mutate(updatedDay);
      setScheduleStatus("Schedule generated successfully!");
      setScheduleStatus(null);
      // const response = await fetch("/api/save-generated-schedule", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     dayId: day._id,
      //     blocks: previewBlocks,
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to save schedule");
      // }

      // const updatedDay = await response.json();
      // mutate(updatedDay);
      setIsPreviewMode(false);
      setPreviewBlocks([]);
      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const generateScheduleTest = async (
    userInput: string,
    startTime: string,
    endTime: string
  ) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGeneratingSchedule(true); // Add this li
    setIsGeneratingScheduleDialogOpen(false);
    setGenerationProgress(0);
    setGenerationStep("Initializing...");

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
      setGenerationProgress(5);
      setGenerationStep("Preparing data for analysis...");

      if (isPreviewMode) {
        setGenerationProgress(20);
        setGenerationStep("Analyzing intent and requirements...");
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
        setGenerationProgress(40);
        setGenerationStep("Processing schedule structure...");
        const regeneratedScedhuleJson = await regeneratedSchedule.json();
        console.log(regeneratedScedhuleJson);
        if (regeneratedScedhuleJson.blocks) {
          setpreviewSchedule(regeneratedScedhuleJson);
          setPreviewBlocks(regeneratedScedhuleJson.blocks);
          setIsPreviewMode(true);
          setPreviewScheduleRationale(
            regeneratedScedhuleJson.scheduleRationale
          );
        }
      } else {
        // First API call
        setGenerationProgress(20);
        setGenerationStep("Analyzing intent and requirements...");
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
        setGenerationProgress(40);
        setGenerationStep("Processing schedule structure...");
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
          setGenerationProgress(60);
          setGenerationStep("Generating default schedule...");
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
          setGenerationProgress(80);
          setGenerationStep("Finalizing schedule...");

          const defaultScedhuleJson = await defaultScedhule.json();
          console.log(defaultScedhuleJson);

          if (defaultScedhuleJson.blocks) {
            setGenerationProgress(90);
            setGenerationStep("Preparing preview...");
            setpreviewSchedule(defaultScedhuleJson);
            setPreviewBlocks(defaultScedhuleJson.blocks);
            setIsPreviewMode(true);
            setPreviewScheduleRationale(defaultScedhuleJson.scheduleRationale);
          }
        }

        if (
          baseSchedulejson.hasEnoughData === false &&
          baseSchedulejson.hasSpecificInstructions === true
        ) {
          console.log("running the specific schedule");
          setGenerationProgress(60);
          setGenerationStep("Generating Specific schedule...");
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
          setGenerationProgress(80);
          setGenerationStep("Finalizing schedule...");
          const userSpecificScedhuleJson = await userSpecificScedhule.json();
          console.log(userSpecificScedhuleJson);
          if (userSpecificScedhuleJson.blocks) {
            setGenerationProgress(90);
            setGenerationStep("Preparing preview...");
            setpreviewSchedule(userSpecificScedhuleJson);
            setPreviewBlocks(userSpecificScedhuleJson.blocks);
            setIsPreviewMode(true);
            setPreviewScheduleRationale(
              userSpecificScedhuleJson.scheduleRationale
            );
          }
        }

        if (
          baseSchedulejson.hasEnoughData === true &&
          baseSchedulejson.hasSpecificInstructions === false
        ) {
          setGenerationProgress(60);
          setGenerationStep("Generating default schedule...");
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
          setGenerationProgress(80);
          setGenerationStep("Finalizing schedule...");
          const automatedScheduleJson = await automatedSchedule.json();
          console.log(automatedScheduleJson);
          if (automatedScheduleJson.blocks) {
            setGenerationProgress(90);
            setGenerationStep("Preparing preview...");
            setpreviewSchedule(automatedScheduleJson);
            setPreviewBlocks(automatedScheduleJson.blocks);
            setIsPreviewMode(true);
            setPreviewScheduleRationale(
              automatedScheduleJson.scheduleRationale
            );
          }
        }

        if (
          baseSchedulejson.hasEnoughData === true &&
          baseSchedulejson.hasSpecificInstructions === true
        ) {
          console.log("running the specific schedule with full blocks");
          setGenerationProgress(60);
          setGenerationStep("Generating specific schedule...");
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
          setGenerationProgress(80);
          setGenerationStep("Finalizing schedule...");
          const userSpecificFullBacklogJson =
            await userSpecificFullBacklog.json();
          console.log(userSpecificFullBacklogJson);
          if (userSpecificFullBacklogJson.blocks) {
            setGenerationProgress(90);
            setGenerationStep("Preparing preview...");
            setpreviewSchedule(userSpecificFullBacklogJson);
            setPreviewBlocks(userSpecificFullBacklogJson.blocks);
            setIsPreviewMode(true);
            setPreviewScheduleRationale(
              userSpecificFullBacklogJson.scheduleRationale
            );
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

      setGenerationProgress(100);
      setGenerationStep("Schedule generated successfully!");
    } catch (error) {
      console.error("Error in schedule generation process:", error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsGeneratingSchedule(false);
      setGenerationProgress(0);
      setIsGeneratingSchedule(false); // Add this line
      abortControllerRef.current = null;
    }
  };

  // const generateScheduleTest = async (
  //   userInput: string,
  //   startTime: string,
  //   endTime: string
  // ) => {
  //   // console.log("Projects:", projects);
  //   // console.log("Original Tasks:", tasks);
  //   // console.log("Routines:", routines);
  //   // console.log("Events:", events);
  //   console.log(userInput, startTime, endTime);

  //   // Get the date and day of the week from the state
  //   const selectedDate = new Date(day.date);
  //   const formattedSelectedDate = selectedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  //   const selectedDayOfWeek = selectedDate.toLocaleString("en-us", {
  //     weekday: "long",
  //   });

  //   console.log("Selected Date:", formattedSelectedDate);
  //   console.log("Selected Day of Week:", selectedDayOfWeek);

  //   // Filter out completed standalone tasks
  //   const incompleteTasks = tasks.filter(
  //     (task) => !task.isRoutineTask && !task.completed
  //   );

  //   // Filter out completed tasks from projects
  //   const projectsWithIncompleteTasks = projects.map((project) => ({
  //     ...project,
  //     tasks: project.tasks.filter((task) => !task.completed),
  //   }));

  //   // Optimize tasks
  //   const optimizedTasks = incompleteTasks.map((task) => {
  //     const { name, description, duration, priority, deadline } = task;
  //     const sanitizedDescription = description.trim().replace(/\n/g, " ");
  //     const parsedDuration = Number(duration);

  //     return {
  //       name,
  //       description: sanitizedDescription,
  //       duration: parsedDuration,
  //       priority,
  //       ...(deadline && !isNaN(Date.parse(deadline)) && { deadline }),
  //     };
  //   });

  //   // Filter and optimize events
  //   const optimizedEvents = events
  //     .filter((event) => {
  //       console.log("Checking event:", event.name);

  //       // Check if the event is for the selected date
  //       if (event.date) {
  //         const eventDate = new Date(event.date).toISOString().split("T")[0];
  //         console.log(
  //           "Event date:",
  //           eventDate,
  //           "Selected date:",
  //           formattedSelectedDate
  //         );
  //         if (eventDate === formattedSelectedDate) {
  //           console.log("Date match");
  //           return true;
  //         }
  //       }

  //       // Check if it's a recurring event for the selected day of the week
  //       if (
  //         event.isRecurring &&
  //         event.days &&
  //         event.days.includes(selectedDayOfWeek)
  //       ) {
  //         console.log("Recurring event match");
  //         return true;
  //       }

  //       console.log("No match");
  //       return false;
  //     })
  //     .map((event) => {
  //       const { name, description, startTime, endTime } = event;
  //       const sanitizedDescription = description.trim().replace(/\n/g, " ");

  //       return {
  //         name,
  //         description: sanitizedDescription,
  //         startTime,
  //         endTime,
  //       };
  //     });

  //   // Filter and optimize routines
  //   const optimizedRoutines = routines
  //     .filter((routine) => routine.days.includes(selectedDayOfWeek))
  //     .map((routine) => ({
  //       name: routine.name,
  //       description: routine.description,
  //       tasks: routine.tasks.map((task) => ({
  //         name: task.name,
  //         description: task.description,
  //         duration: Number(task.duration),
  //         priority: task.priority,
  //       })),
  //     }));

  //   const optimizedProjects = projectsWithIncompleteTasks.map((project) => ({
  //     id: project._id,
  //     name: project.name,
  //     description: project.description,
  //     deadline: project.deadline,
  //     priority: project.priority,
  //     tasks: project.tasks.map((task) => ({
  //       id: task._id,
  //       name: task.name,
  //       description: task.description,
  //       completed: task.completed,
  //       priority: task.priority,
  //       duration: Number(task.duration),
  //       projectId: project._id,
  //       deadline: task.deadline,
  //     })),
  //   }));

  //   // console.log("Optimized Projects:", optimizedProjects);
  //   // console.log("Optimized Tasks:", optimizedTasks);
  //   // console.log("Optimized Events:", optimizedEvents);
  //   // console.log("Optimized Routines:", optimizedRoutines);

  //   try {
  //     const baseSchedule = await fetch("/api/set-base-schedule", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         projects: optimizedProjects,
  //         eventBlocks: events,
  //         routineBlocks: routines,
  //         tasks: optimizedTasks,
  //         userInput: userInput,
  //         startTime: startTime,
  //         endTime: endTime,
  //       }),
  //     });

  //     const baseSchedulejson = await baseSchedule.json();
  //     console.log("Generated Initial Schedule:", baseSchedulejson);

  //     const response = await fetch("/api/generate-schedule-test", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         baseSchedulejson: baseSchedulejson,
  //         userInput: userInput,
  //         startTime: startTime,
  //         endTime: endTime,
  //         eventBlocks: optimizedEvents,
  //         routineBlocks: optimizedRoutines,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate initial schedule");
  //     }

  //     const generatedSchedule = await response.json();
  //     console.log("Generated Initial Schedule:", generatedSchedule);

  //     // New API call to generate-schedule-add-tasks
  //     const taskIntegrationResponse = await fetch(
  //       "/api/generate-schedule-add-tasks",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           generatedSchedule: generatedSchedule,
  //           userInput: userInput,
  //           startTime: startTime,
  //           endTime: endTime,
  //           projects: optimizedProjects,
  //           standaloneTasks: optimizedTasks,
  //         }),
  //       }
  //     );

  //     if (!taskIntegrationResponse.ok) {
  //       throw new Error("Failed to integrate tasks into schedule");
  //     }

  //     const finalSchedule = await taskIntegrationResponse.json();
  //     console.log("Final Schedule with Integrated Tasks:", finalSchedule);

  //     console.log("Optimizing schedule for flow and productivity...");

  //     // New API call to optimize for flow and productivity
  //     const flowOptimizationResponse = await fetch(
  //       "/api/optimize-schedule-flow",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           currentSchedule: finalSchedule,
  //           userPreferences: {
  //             peakProductivityHours: ["09:00", "14:00"], // Example data, adjust as needed
  //             preferredWorkPattern: "longer focused sessions",
  //           },
  //         }),
  //       }
  //     );

  //     if (!flowOptimizationResponse.ok) {
  //       throw new Error("Failed to optimize schedule for flow");
  //     }

  //     const optimizedSchedule = await flowOptimizationResponse.json();
  //     console.log("Flow-Optimized Schedule:", optimizedSchedule);

  //     // Here you can update your state or perform any other actions with the final schedule
  //     // For example:
  //     // setSchedule(finalSchedule);
  //   } catch (error) {
  //     console.error("Error in schedule generation process:", error);
  //   }
  // };

  const generateSchedule = async () => {
    // Count all tasks (standalone and from projects)
    const standaloneTasks = tasks.filter(
      (task) => !task.isRoutineTask && !task.completed
    ).length;
    const projectTasks = projects.reduce(
      (sum, project) =>
        sum + project.tasks.filter((task) => !task.completed).length,
      0
    );
    const totalTasks = standaloneTasks + projectTasks;

    console.log("Generating schedule...");

    if (totalTasks < MINIMUM_TASKS_REQUIRED) {
      alert(`To create your personalized schedule, please add:

- Tasks or projects in 'Projects' and 'Tasks'
- Upcoming events in 'Events'
- Daily or weekly routines in 'Routines'

Use the toolbar to access these sections and input your information.`);
      return;
    }

    if (hasPendingBlocks) {
      toast.error("Please complete all blocks before generating a schedule", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setIsGeneratingSchedule(true);
    setScheduleStatus("Generating your personalized schedule...");

    // Get the current date and time
    const now = new Date();
    const formattedCurrentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    const formattedCurrentDate = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Filter out completed standalone tasks
    const incompleteTasks = tasks.filter(
      (task) => !task.isRoutineTask && !task.completed
    );

    // Filter out completed tasks from projects
    const projectsWithIncompleteTasks = projects.map((project) => ({
      ...project,
      tasks: project.tasks.filter((task) => !task.completed),
    }));

    const userInformation = {
      name: "John Doe",
      date: formattedCurrentDate,
      currentTime: formattedCurrentTime,
      projects: projectsWithIncompleteTasks,
      stand_alone_tasks: incompleteTasks,
      routines: routines,
      events: events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.toISOString().split("T")[0] === formattedCurrentDate &&
          event.startTime >= formattedCurrentTime
        );
      }),
    };

    try {
      const response = await fetch("/api/generateSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInformation,
          formattedCurrentTime,
          formattedCurrentDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedResponse: ScheduleResponse = await response.json();
      console.log("AI response:", parsedResponse);
      setAiResponse(parsedResponse);

      // Send the parsed response to the scheduler route
      const schedulerResponse = await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayId: day._id,
          schedule: parsedResponse,
          userId: user._id,
        }),
      });

      if (!schedulerResponse.ok) {
        throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
      }

      const updatedDay = await schedulerResponse.json();
      console.log("Updated day:", updatedDay);

      // Update the local state or trigger a refetch of the day data
      mutate(updatedDay);
      setScheduleStatus("Schedule generated successfully!");
      setScheduleStatus(null);
    } catch (error) {
      console.error("An error occurred:", error);
      alert(
        "An error occurred while generating the schedule. Please try again."
      );
      setScheduleStatus("Failed to generate schedule. Please try again.");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleAddBlock = async () => {
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
      setNewBlock({ name: "", startTime: "", endTime: "" });

      // Update the day view
      updateDay();
      toast.success("New block added successfully");
    } catch (error) {
      console.error("Error adding block:", error);
      toast.error("Failed to add new block. Please try again.");
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleAddTaskToBlock = (task: Task) => {
    // if (selectedBlockId) {
    //   // Logic to add the task to the block
    //   // This might involve updating the day state and calling an API
    //   mutate(
    //     (currentDay: Day) => ({
    //       ...currentDay,
    //       blocks: currentDay.blocks.map((block) =>
    //         block._id === selectedBlockId
    //           ? { ...block, tasks: [...block.tasks, task] }
    //           : block
    //       ),
    //     }),
    //     false
    //   );
    // }
    setIsAddTaskModalOpen(false);
  };

  const handleAddRoutine = () => {
    setIsAddRoutineModalOpen(true);
  };

  const handleAddTask = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsAddTaskModalOpen(true);
  };
  const handleAddEvent = () => {
    setIsAddEventModalOpen(true);
  };

  const updateDay = () => {
    mutate();
  };

  // First, modify the updatePerformanceRating function
  const updatePerformanceRating = async (updatedDay: Day) => {
    try {
      const perfResponse = await fetch("/api/getPerformanceRating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updatedDay: updatedDay,
        }),
      });

      if (!perfResponse.ok) {
        throw new Error("Failed to update performance rating");
      }

      const newPerformanceRating = await perfResponse.json();

      console.log(newPerformanceRating);

      // Update the performance rating in the database
      const updateResponse = await fetch(`/api/days/${day._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ performanceRating: newPerformanceRating }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to save performance rating");
      }

      // Update the local state
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          performanceRating: newPerformanceRating,
        }),
        false
      );
    } catch (error) {
      console.error("Error updating performance rating:", error);
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

      // Trigger performance rating update with the constructed updated day
      await updatePerformanceRating(updatedDay);

      // Finally, trigger a revalidation to ensure everything is in sync
      mutate();
    } catch (error) {
      console.error("Error completing block:", error);
      toast.error("Failed to complete block. Please try again.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading day data</div>;
  if (!day) return <div>No day data available</div>;
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  const completedBlocks = day.blocks.filter(
    (block: Block) => block.status === "complete"
  );

  const incompleteBlocks = day.blocks.filter(
    (block: Block) => block.status === "pending"
  );

  // const onTaskCheckChange = (taskId: string, completed: boolean) => {
  //   setUpdatingTasks((prev) => new Set(prev).add(taskId));
  //   handleTaskCompletion(taskId, completed);
  // };

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

  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task: Task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  const getCompletedBlocksCount = (blocks: Block[]): number => {
    return blocks.filter((block: Block) => block.status === "complete").length;
  };

  const completedBlocksCount = getCompletedBlocksCount(day.blocks);
  const blockCount = day.blocks.length;

  const getBlockCompletionRate = (blocks: Block[]): number => {
    const totalBlocks = blocks.length;
    const completedBlocks = blocks.filter(
      (block: Block) => block.status === "complete"
    ).length;
    return totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;
  };

  const getTaskCompletionRate = (blocks: Block[]): number => {
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
  const blockCompletionRate = getBlockCompletionRate(day.blocks);
  const taskCompletionRate = getTaskCompletionRate(day.blocks);

  const getTasksCount = (
    blocks: Block[]
  ): { total: number; completed: number } => {
    return blocks.reduce(
      (acc: { total: number; completed: number }, block) => {
        if (block.tasks) {
          acc.total += block.tasks.length;
          acc.completed += block.tasks.filter((task) => task.completed).length;
        }
        return acc;
      },
      { total: 0, completed: 0 }
    );
  };

  const { total: totalTasks, completed: completedTasks } = getTasksCount(
    day.blocks
  );

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

        const { updatedBlock, updatedTask } = await response.json();

        // Update the day using setDay
        setDay((currentDay: Day) => ({
          ...currentDay,
          blocks: currentDay.blocks.map((b) => {
            if (typeof b === "string" || b._id !== block._id) return b;
            return updatedBlock;
          }),
        }));

        // Update the tasks in the global context
        setTasks((currentTasks) =>
          currentTasks.map((t) =>
            t._id === task._id ? { ...t, block: null } : t
          )
        );

        toast.success("Task removed from block and moved to your task list");
      } catch (error) {
        console.error("Error removing task from block:", error);
        toast.error("Failed to remove task from block. Please try again.");
      }
    }
  };

  // const handleRemoveTaskFromBlock = async (task: Task, block: Block) => {
  //   if (
  //     window.confirm(
  //       "Are you sure you want to remove this task from the block? It will still be available in your task list."
  //     )
  //   ) {
  //     try {
  //       const response = await fetch(`/api/blocks/${block._id}`, {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           action: "removeTask",
  //           taskId: task._id,
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to remove task from block");
  //       }

  //       const { updatedBlock, updatedTask } = await response.json();

  //       // Update the day data in the context using setDay
  //       setDay((prevDay) => {
  //         const updatedBlocks = prevDay.blocks.map((b) => {
  //           if (typeof b === "string" || b._id !== block._id) return b;
  //           return updatedBlock;
  //         });

  //         return {
  //           ...prevDay,
  //           blocks: updatedBlocks,
  //         };
  //       });

  //       alert(
  //         "Task removed from this block. You can find it in your task list."
  //       );
  //     } catch (error) {
  //       console.error("Error removing task from block:", error);
  //       alert("Failed to remove task from block. Please try again.");
  //     }
  //   }
  // };

  // const handleRemoveTaskFromBlock = async (task: Task, block: Block) => {
  //   if (
  //     window.confirm(
  //       "Are you sure you want to remove this task from the block? It will still be available in your task list."
  //     )
  //   ) {
  //     try {
  //       const response = await fetch(`/api/blocks/${block._id}`, {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           action: "removeTask",
  //           taskId: task._id,
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to remove task from block");
  //       }

  //       const { updatedBlock, updatedTask } = await response.json();

  //       mutate(
  //         (currentDay: Day) => ({
  //           ...currentDay,
  //           blocks: currentDay.blocks.map((b) => {
  //             if (typeof b === "string" || b._id !== block._id) return b;
  //             return updatedBlock;
  //           }),
  //         }),
  //         false
  //       );

  //       alert(
  //         "Task removed from this block. You can find it in your task list."
  //       );
  //     } catch (error) {
  //       console.error("Error removing task from block:", error);
  //       alert("Failed to remove task from block. Please try again.");
  //     }
  //   }
  // };

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

        const data = await response.json();

        mutate(
          (currentDay: Day) => ({
            ...currentDay,
            blocks: currentDay.blocks.map((b) => {
              if (typeof b === "string" || b._id !== block._id) return b;
              return (
                data.updatedBlock || {
                  ...b,
                  tasks: b.tasks.filter((t) => t._id !== task._id),
                }
              );
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
  interface PerformanceRating {
    level: PerformanceLevel;
    score: number;
    comment: string;
  }

  const handleRemoveBlockFromSchedule = async (blockId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this event from your schedule?"
      )
    ) {
      try {
        const response = await fetch(`/api/remove-block-from-schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ blockId, dayId: day._id }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove block from schedule");
        }

        const data = await response.json();

        // Update the local state
        mutate(
          (currentDay: Day) => ({
            ...currentDay,
            blocks: currentDay.blocks.filter((b) => {
              if (typeof b === "string") return b !== blockId;
              return b._id !== blockId;
            }),
          }),
          false
        );

        toast.success("Event removed from schedule successfully");
      } catch (error) {
        console.error("Error removing block from schedule:", error);
        toast.error("Failed to remove event from schedule. Please try again.");
      }
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

      updatePerformanceRating(updatedDay);

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

  const handleTestApi = async () => {
    try {
      const response = await fetch("/api/test-gpt", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const data = await response.json();
      setApiResponse(data.message);
    } catch (error) {
      console.error("Error testing API:", error);
      setApiResponse("Error occurred while testing API");
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

      const completedDay = await response.json();

      // Update the local state
      mutate(
        (currentDay: Day) => ({
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

      const completedDay = await response.json();

      // Update the local state
      mutate(
        (currentDay: Day) => ({
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

  // Add the cancel handler
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGeneratingSchedule(false);
  };
  // console.log("is this even working");
  // console.log(day);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {day.completed === true ? (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Day Complete
            </h1>
            <Button variant="outline" size="sm" onClick={handleReactivateDay}>
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
                  {completedBlocks.map((block: Block) => (
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
                        {block.tasks &&
                          block.tasks.map((task) => (
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
                        {Math.round(
                          (taskCompletionRate + blockCompletionRate) / 2
                        )}
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
                  Performance Rating: {day.performanceRating.level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-primary mb-4">
                    {day.performanceRating.score}/10
                  </div>
                  <p className="text-center text-muted-foreground">
                    {day.performanceRating.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {/* <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>Daily Planner</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  {isPreviewMode
                    ? "Do you want to edit you plan"
                    : "Generate your daily plan"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleGenerateSchedule}
                  disabled={isGeneratingSchedule}
                >
                  {isGeneratingSchedule ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isPreviewMode ? "Regenerate Plan" : "Generate Plan"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card> */}
            <Card className="hidden md:block">
              <CardHeader className="pb-2">
                <CardDescription>Tasks Completed</CardDescription>
                <CardTitle className="text-4xl">{`${completedTasks}/${totalTasks}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {totalTasks > 0
                    ? `${Math.round(
                        (completedTasks / totalTasks) * 100
                      )}% completion rate`
                    : "0% completion rate"}
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={taskCompletionRate}
                  aria-label={`${Math.round(
                    taskCompletionRate
                  )}% tasks completed`}
                />
              </CardFooter>
            </Card>
            <Card className="hidden md:block">
              <CardHeader className="pb-2">
                <CardDescription>Time Blocks Completed</CardDescription>
                <CardTitle className="text-4xl">{`${completedBlocksCount}/${blockCount}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {blockCount - completedBlocksCount} blocks remaining
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={blockCompletionRate}
                  aria-label={`${Math.round(
                    blockCompletionRate
                  )}% time blocks completed`}
                />
              </CardFooter>
            </Card>
            <Card className="hidden md:block">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  Performance Score
                  {/* <Badge variant="outline" className="text-xs">
                    Next update: 5:00 PM
                  </Badge> */}
                </CardDescription>
                <CardTitle className="text-4xl">
                  {day.performanceRating
                    ? `${day.performanceRating.score}/10`
                    : "0/10"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {day.performanceRating
                      ? day.performanceRating.level
                      : "Preparing for Takeoff"}
                  </div>
                  <Popover>
                    <PopoverTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <p className="text-sm">
                        {day.performanceRating
                          ? day.performanceRating.comment
                          : "Complete tasks to see your performance rating!"}
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={
                    day.performanceRating ? day.performanceRating.score * 10 : 0
                  }
                  aria-label="Performance score"
                />
              </CardFooter>
            </Card>
          </div>

          <Tabs defaultValue="active" className="w-full">
            {!isPreviewMode && (
              <div className="flex items-center mb-4">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    onClick={handleAddRoutine}
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Routine
                    </span>
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Event
                    </span>
                  </Button>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline" // Add this to match other buttons
                        size="sm"
                        className="h-7 gap-1 bg-white" // Added bg-white to match others
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Add Block
                        </span>
                      </Button>
                      {/* <Button size="sm" className="h-7 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Add Block
                        </span>
                      </Button> */}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Block</DialogTitle>
                        <DialogDescription>
                          Create a new time block for your schedule.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newBlock.name}
                            onChange={(e) =>
                              setNewBlock({ ...newBlock, name: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="startTime" className="text-right">
                            Start Time
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newBlock.startTime}
                            onChange={(e) =>
                              setNewBlock({
                                ...newBlock,
                                startTime: e.target.value,
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="endTime" className="text-right">
                            End Time
                          </Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newBlock.endTime}
                            onChange={(e) =>
                              setNewBlock({
                                ...newBlock,
                                endTime: e.target.value,
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleAddBlock}>
                          Add Block
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={handleGenerateSchedule}
                    disabled={isGeneratingSchedule}
                    size="sm"
                    className="h-7 gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Generate Schedule
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {isGeneratingSchedule && (
              <LoadingMessages
                isLoading={isGeneratingSchedule}
                onCancel={handleCancelGeneration}
                isCancellable={true}
                progress={generationProgress}
                currentStep={generationStep}
              />
            )}

            <TabsContent value="active" className="space-y-4">
              {isPreviewMode ? (
                <Card className="mb-4 border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-xl text-primary">
                          Schedule Preview
                        </CardTitle>
                        <CardDescription className="text-base">
                          Review your generated schedule before saving
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={handleDiscardPreview}
                          variant="outline"
                          className="flex-1 sm:flex-none"
                        >
                          Discard Preview
                        </Button>
                        <Button
                          onClick={handleSaveGeneratedSchedule}
                          className="bg-primary flex-1 sm:flex-none"
                        >
                          Save Schedule
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* <div className="bg-muted rounded-lg p-4">
                      <h3 className="font-medium text-base mb-2">
                        Schedule Rationale:
                      </h3>
                      <p className="text-muted-foreground">
                        {previewScheduleRationale}
                      </p>
                    </div> */}

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Proposed Time Blocks
                      </h3>

                      {previewBlocks.map((block, blockIndex) => (
                        <Card
                          key={`preview-block-${blockIndex}`}
                          className="border border-muted"
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                              <CardTitle>{block.name}</CardTitle>
                              <CardDescription>{`${block.startTime} - ${block.endTime}`}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {block.event && (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800"
                                >
                                  Event
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          {block.description && (
                            <div className="mx-6 my-3 p-3 rounded-lg bg-card shadow-sm border border-border/50">
                              <div className="flex gap-3 items-start">
                                <InfoIcon className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
                                <p className="text-sm leading-relaxed">
                                  {block.description}
                                </p>
                              </div>
                            </div>
                          )}
                          <CardContent>
                            {block.tasks && block.tasks.length > 0 && (
                              <div className="space-y-2">
                                {block.tasks.map((task, taskIndex) => (
                                  <Card
                                    key={`preview-task-${blockIndex}-${taskIndex}`}
                                    className="bg-muted/50 relative"
                                  >
                                    <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center space-x-3 min-w-[200px]">
                                        <div className="flex-shrink-0">
                                          <Checkbox
                                            id={`preview-task-${blockIndex}-${taskIndex}`}
                                            disabled
                                            checked={false}
                                          />
                                        </div>
                                        <div>
                                          <label
                                            htmlFor={`preview-task-${blockIndex}-${taskIndex}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {task.name}
                                          </label>
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="text-xs whitespace-nowrap">
                                          {task.isRoutineTask
                                            ? "Routine"
                                            : "Task"}
                                        </Badge>
                                        <Badge
                                          className={`text-xs whitespace-nowrap ${
                                            task.priority === "High"
                                              ? "bg-red-100 text-red-800"
                                              : task.priority === "Medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {task.priority}
                                        </Badge>
                                        <Badge className="text-xs whitespace-nowrap">
                                          {task.duration} min
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : day.blocks.length > 0 && blockCompletionRate === 100 ? (
                <Card className="w-full border-2 border-primary/10 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                      <AlertCircle className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span>All Blocks Completed</span>
                    </CardTitle>
                  </CardHeader>
                  <Separator className="mb-4" />
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p>
                        Congratulations! You have completed all your blocks for
                        the day.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                      <Button
                        onClick={handleCompleteDay}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Complete Day
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        Add New Block
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : sortedBlocks.length === 0 ? ( // Add this condition
                <div className="flex h-[600px] w-full max-w-[100vw] px-2 md:px-0">
                  <Card className="flex w-full bg-muted/50">
                    <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                      <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h3 className="mb-2 text-2xl font-semibold">
                        No Blocks Scheduled
                      </h3>
                      <p className="mb-4 max-w-md text-muted-foreground">
                        Start planning your day by adding time blocks, routines,
                        or events. You can also generate a schedule based on
                        your tasks and preferences.
                      </p>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <Button
                          onClick={handleGenerateSchedule}
                          disabled={isGeneratingSchedule}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isGeneratingSchedule
                            ? "Generating..."
                            : "Generate Schedule"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add First Block
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {day &&
                    sortedBlocks.map(
                      (blockOrString: Block | string, index: number) => {
                        const block =
                          typeof blockOrString === "string"
                            ? ({ _id: blockOrString } as Block)
                            : (blockOrString as Block);

                        const isEventBlock = !!block.event;

                        return (
                          <Card key={block._id || index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <div>
                                <CardTitle>
                                  {isEventBlock
                                    ? `Event: ${block.name}`
                                    : block.name}
                                </CardTitle>
                                <CardDescription>{`${block.startTime} - ${block.endTime}`}</CardDescription>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onSelect={() => handleEditBlock(block)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => handleDeleteBlock(block)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                  {isEventBlock && (
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        handleRemoveBlockFromSchedule(block._id)
                                      }
                                    >
                                      Remove from Schedule
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {/* {isEventBlock ? (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Event
                        </Badge>
                      ) : (
                        block.tasks &&
                        block.tasks.length > 0 && (
                          <Badge>{block.tasks[0].status}</Badge>
                        )
                      )} */}
                            </CardHeader>
                            <CardContent>
                              {isEventBlock ? (
                                <div className="text-sm text-gray-600">
                                  <Clock className="inline-block mr-2 h-4 w-4" />
                                  {block.description ||
                                    "No description available"}
                                </div>
                              ) : (
                                <>
                                  {block.tasks && block.tasks.length > 0 && (
                                    <Progress
                                      value={calculateProgress(block.tasks)}
                                      className="h-2 mt-2 mb-4"
                                    />
                                  )}
                                  <div className="space-y-2">
                                    {block.tasks &&
                                      block.tasks.map(
                                        (task: Task, taskIndex: number) => (
                                          <Card
                                            key={task._id || taskIndex}
                                            className="bg-muted relative"
                                          >
                                            <CardContent className="p-3 flex items-center justify-between">
                                              <div className="flex items-center space-x-3">
                                                {selectedDay !== "tomorrow" && (
                                                  <div className="flex-shrink-0">
                                                    {updatingTasks &&
                                                    updatingTaskId ===
                                                      task._id ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                      <Checkbox
                                                        id={`task-${
                                                          task._id || taskIndex
                                                        }`}
                                                        checked={task.completed}
                                                        onCheckedChange={(
                                                          checked
                                                        ) =>
                                                          handleTaskCompletion(
                                                            task._id,
                                                            checked as boolean
                                                          )
                                                        }
                                                        disabled={updatingTasks}
                                                      />
                                                    )}
                                                  </div>
                                                )}

                                                <div>
                                                  <label
                                                    htmlFor={`task-${
                                                      task._id || taskIndex
                                                    }`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                  >
                                                    {task.name}
                                                  </label>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                {/* New Code (Modify like this) */}
                                                {task.projectId ? (
                                                  <Badge className="text-xs hidden md:inline-flex bg-purple-100 text-purple-800">
                                                    Project
                                                  </Badge>
                                                ) : task.isRoutineTask ? (
                                                  <Badge className="text-xs hidden md:inline-flex bg-green-100 text-green-800">
                                                    Routine
                                                  </Badge>
                                                ) : (
                                                  <Badge className="text-xs hidden md:inline-flex">
                                                    Stand-alone
                                                  </Badge>
                                                )}
                                                <Badge
                                                  className={`text-xs hidden md:inline-flex ${
                                                    task.priority === "High"
                                                      ? "bg-red-100 text-red-800"
                                                      : task.priority ===
                                                        "Medium"
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-green-100 text-green-800"
                                                  }`}
                                                >
                                                  {task.priority}
                                                </Badge>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button
                                                      aria-haspopup="true"
                                                      size="icon"
                                                      variant="ghost"
                                                    >
                                                      <MoreHorizontal className="h-4 w-4" />
                                                      <span className="sr-only">
                                                        Actions
                                                      </span>
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                      Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                      onSelect={() =>
                                                        handleEditTask(task)
                                                      }
                                                    >
                                                      Edit
                                                    </DropdownMenuItem>
                                                    {!task.isRoutineTask && (
                                                      <DropdownMenuItem
                                                        onSelect={() =>
                                                          handleRemoveTaskFromBlock(
                                                            task,
                                                            block
                                                          )
                                                        }
                                                      >
                                                        Remove from Block
                                                      </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                      onSelect={() =>
                                                        handleDeleteTask(
                                                          task,
                                                          block
                                                        )
                                                      }
                                                    >
                                                      Delete Task
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                                {/* <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                      <span className="sr-only">
                                        Drag handle
                                      </span>
                                    </Button> */}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )
                                      )}
                                  </div>
                                </>
                              )}
                              <div className="flex justify-end mt-4 space-x-2">
                                {!isEventBlock && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                    onClick={() => handleAddTask(block._id)}
                                  >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Task
                                  </Button>
                                )}
                                {selectedDay !== "tomorrow" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-black text-white"
                                    onClick={() =>
                                      handleCompleteBlock(block._id)
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete {isEventBlock ? "Event" : "Block"}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                </>
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              {completedBlocks.length === 0 ? (
                <div className="flex h-[600px] w-full max-w-[100vw] px-2 md:px-0">
                  <Card className="flex w-full bg-muted/50">
                    <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                      <CheckCircle className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />{" "}
                      {/* Changed icon */}
                      <h3 className="mb-2 text-2xl font-semibold text-muted-foreground">
                        No Completed Blocks Yet
                      </h3>
                      <p className="mb-4 max-w-md text-sm text-muted-foreground/80 leading-relaxed">
                        Completed blocks will appear here. Complete a block by
                        clicking the "Complete Block" button when you've
                        finished all tasks within it.
                      </p>
                      <div className="mt-2 flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground/60">
                          You can track your daily progress and productivity
                          metrics once you start completing blocks.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                day &&
                completedBlocks.map(
                  (blockOrString: Block | string, index: number) => {
                    const block =
                      typeof blockOrString === "string"
                        ? ({ _id: blockOrString } as Block)
                        : (blockOrString as Block);

                    const isEventBlock = !!block.event;

                    return (
                      <Card key={block._id || index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div>
                            <CardTitle>
                              {isEventBlock
                                ? `Event: ${block.name}`
                                : block.name}
                            </CardTitle>
                            <CardDescription>{`${block.startTime} - ${block.endTime}`}</CardDescription>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </CardHeader>
                        <CardContent>
                          {isEventBlock ? (
                            <div className="text-sm text-gray-600">
                              <Clock className="inline-block mr-2 h-4 w-4" />
                              {block.description || "No description available"}
                            </div>
                          ) : (
                            <>
                              <Progress
                                value={calculateProgress(block.tasks)}
                                className="h-2 mt-2 mb-4 bg-gray-200"
                              />
                              <div className="space-y-2">
                                {block.tasks &&
                                  block.tasks.map(
                                    (task: Task, taskIndex: number) => (
                                      <Card
                                        key={task._id || taskIndex}
                                        className="bg-muted relative"
                                      >
                                        <CardContent className="p-3 flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                              <Checkbox
                                                id={`task-${
                                                  task._id || taskIndex
                                                }`}
                                                checked={task.completed}
                                                disabled
                                              />
                                            </div>
                                            <div>
                                              <label
                                                htmlFor={`task-${
                                                  task._id || taskIndex
                                                }`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                {task.name}
                                              </label>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Badge className="text-xs hidden md:inline-flex">
                                              {task.isRoutineTask
                                                ? "Routine"
                                                : "Stand-alone"}
                                            </Badge>
                                            <Badge className="text-xs hidden md:inline-flex">
                                              {task.priority}
                                            </Badge>
                                            <Badge className="text-xs">
                                              {task.duration} min
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )
                                  )}
                              </div>
                            </>
                          )}
                          <div className="flex justify-end mt-4 space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                              onClick={() => handleReactivateBlock(block._id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reactivate {isEventBlock ? "Event" : "Block"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )
              )}
            </TabsContent>
          </Tabs>

          {/* <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {tags.map((tag) => (
            <>
              <div key={tag} className="text-sm">
                {tag}
              </div>
              <Separator className="my-2" />
            </>
          ))}
        </div>
      </ScrollArea> */}
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
          <AddEventModal
            isOpen={isAddEventModalOpen}
            onClose={() => setIsAddEventModalOpen(false)}
            blockId={selectedBlockId && selectedBlockId}
            updateDay={updateDay}
          />
          <AddRoutineModal
            isOpen={isAddRoutineModalOpen}
            onClose={() => setIsAddRoutineModalOpen(false)}
            blockId={selectedBlockId && selectedBlockId}
            updateDay={updateDay}
          />
          <ScheduleGenerationDialog
            isOpen={isGeneratingScheduleDialogOpen}
            onClose={() => setIsGeneratingScheduleDialogOpen(false)}
            onGenerateSchedule={generateScheduleTest}
            isPreviewMode={isPreviewMode}
          />
          {/* Add EditBlockDialog and EditTaskDialog components */}
          {/* {editingBlock && (
            <EditBlockDialog
              block={editingBlock}
              isOpen={!!editingBlock}
              onClose={() => setEditingBlock(null)}
              onSave={handleSaveBlock}
            />
          )} */}
          {editingTask && (
            <EditTaskDialog
              task={editingTask}
              isOpen={!!editingTask}
              onClose={() => setEditingTask(null)}
              onSave={handleSaveTask}
            />
          )}
          {/* <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle>Test GPT API</CardTitle>
          <CardDescription>Test the ChatGPT API connection</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={handleTestApi}>
            Test API
          </Button>
        </CardFooter>
      </Card> */}
          {/* {apiResponse && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{apiResponse}</p>
          </CardContent>
        </Card>
      )} */}
          {/* {availableuserInformation && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(availableuserInformation, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      {aiResponse && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(aiResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      {day && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(incompleteBlocks, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )} */}
        </>
      )}
    </main>
  );
};

export default DashboardPage;
