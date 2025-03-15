"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  CheckCircle,
  Loader2,
  ListTodo,
  Calendar,
} from "lucide-react";
import {
  Task,
  Project,
  Block,
  Day,
  PreviewSchedule,
} from "@/app/context/models";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  blockId: string | null;
  updateDay: () => void; // New prop to update the day state
  day: Day; // This prop was missing
  isCustomDuration: false;
  isPreviewMode: boolean; // Add this prop
}

const updatePreviewStorage = (updatedSchedule: PreviewSchedule) => {
  localStorage.setItem("previewSchedule", JSON.stringify(updatedSchedule));
};

const projectsData = [
  {
    id: "1",
    name: "Website Redesign",
    tasks: [
      {
        id: "A1",
        name: "Design homepage mockup",
        description: "Create a new design for the homepage",
        priority: "High",
      },
      {
        id: "A2",
        name: "Implement responsive layout",
        description: "Ensure the website is mobile-friendly",
        priority: "Medium",
      },
      {
        id: "A3",
        name: "Optimize images",
        description: "Compress and optimize all images for web",
        priority: "Low",
      },
      // ... more tasks
    ],
  },
  {
    id: "2",
    name: "Mobile App Development",
    tasks: [
      {
        id: "B1",
        name: "Design user interface",
        description: "Create UI designs for the mobile app",
        priority: "High",
      },
      {
        id: "B2",
        name: "Develop login functionality",
        description: "Implement user authentication",
        priority: "High",
      },
      {
        id: "B3",
        name: "Create settings page",
        description: "Develop the app settings page",
        priority: "Medium",
      },
      // ... more tasks
    ],
  },
];

const existingTasks = [
  {
    id: "E1",
    name: "Update documentation",
    description: "Review and update project documentation",
    priority: "Medium",
  },
  {
    id: "E2",
    name: "Client meeting preparation",
    description: "Prepare slides for the upcoming client meeting",
    priority: "High",
  },
  {
    id: "E3",
    name: "Bug fixing",
    description: "Address reported bugs in the latest release",
    priority: "High",
  },
  // ... more tasks
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  blockId,
  updateDay,
  day,
  isPreviewMode,
}) => {
  const [selectedProject, setSelectedProject] = useState(projectsData[0].id);
  const [activeTab, setActiveTab] = useState<string>("newTask");
  const {
    tasks,
    projects,
    setProjects,
    setTasks,
    setBlocks,
    setPreviewSchedule,
  } = useAppContext();
  const { userId } = useAuth();
  const [newTask, setNewTask] = useState<Partial<Task> & { duration: number }>({
    name: "",
    description: "",
    duration: 5,
    isCustomDuration: false,
    completed: false,
    block: null,
    project: null,
    type: "deep-work",
    priority: "Medium",
    isRoutineTask: false,
  });

  const [todaySchedule, setTodaySchedule] = useState<Day | null>(null);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<Day | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
  });
  const router = useRouter();

  // Check if selected day is tomorrow and get today's date in YYYY-MM-DD format
  const { isTomorrow, todayDate } = useMemo(() => {
    const selectedDate = new Date(day.date);
    const today = new Date();
    const isTomorrow = selectedDate.getDate() === today.getDate() + 1;

    // Format today's date as YYYY-MM-DD
    const todayDate = today.toISOString().split("T")[0];

    return { isTomorrow, todayDate };
  }, [day.date]);

  // Update the useEffect to fetch the appropriate schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!isTomorrow && !tomorrowSchedule) {
        // If we're on today's view, fetch tomorrow's schedule
        setIsLoadingSchedule(true);
        try {
          const tomorrow = new Date(todayDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowDate = tomorrow.toISOString().split("T")[0];

          const response = await fetch("/api/get-tomorrow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              date: tomorrowDate,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch tomorrow's schedule");
          }
          const data = await response.json();
          // console.log("Fetched tomorrow's schedule:", data);
          setTomorrowSchedule(data);
        } catch (error) {
          console.error("Error fetching tomorrow's schedule:", error);
        } finally {
          setIsLoadingSchedule(false);
        }
      } else if (isTomorrow && !todaySchedule) {
        // If we're on tomorrow's view, fetch today's schedule
        setIsLoadingSchedule(true);
        try {
          const response = await fetch("/api/get-today", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              date: todayDate,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch today's schedule");
          }
          const data = await response.json();
          console.log("Fetched today's schedule:", data);
          setTodaySchedule(data);
        } catch (error) {
          console.error("Error fetching today's schedule:", error);
        } finally {
          setIsLoadingSchedule(false);
        }
      }
    };

    fetchSchedule();
  }, [isTomorrow, userId, todayDate]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      console.log("tasks", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      const projectsArray = data.projects || [];
      setProjects(projectsArray);

      // Find the first incomplete project to set as the initial selected project
      const incompleteProjects = projectsArray.filter(
        (project: { completed: any }) => !project.completed
      );
      if (incompleteProjects.length > 0) {
        setSelectedProject(incompleteProjects[0]._id);
      } else if (projectsArray.length > 0) {
        // Fallback to the first project if all are completed
        setSelectedProject(projectsArray[0]._id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  useEffect(() => {
    if (activeTab === "existingTask") {
      fetchTasks();
    }
    if (activeTab === "projectTask") {
      console.log("fetching projects");
      fetchProjects();
    }
  }, [activeTab, isOpen]); // Add isOpen to the dependency array

  const firstpreviewSchedule = JSON.parse(
    localStorage.getItem("schedule") || "{}"
  );
  console.log(firstpreviewSchedule);

  const addTaskToBlock = async (task: Task) => {
    if (isPreviewMode) {
      // Handle preview mode
      try {
        const taskToAdd = task._id
          ? { ...task, block: blockId, blockId: blockId }
          : { ...task, _id: task._id || `temp-${Date.now()}` };
        // Get current preview schedule
        const previewSchedule = JSON.parse(
          localStorage.getItem("schedule") ||
            JSON.stringify({
              currentTime: new Date().toLocaleTimeString(),
              scheduleRationale: "",
              userStartTime: "",
              userEndTime: "",
              blocks: [],
            })
        );

        // Find the block and add the task
        const updatedBlocks = previewSchedule.blocks.map(
          (block: { _id: string | null; tasks: any }) => {
            if (block._id === blockId) {
              return {
                ...block,
                tasks: [...(block.tasks || []), taskToAdd],
              };
            }
            return block;
          }
        );

        console.log("Updated Blocks", updatedBlocks);

        // // Update preview schedule
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        // // Save to localStorage
        updatePreviewStorage(updatedSchedule);

        // // Update UI state
        setPreviewSchedule(updatedSchedule);

        onClose();
      } catch (error) {
        console.error("Error adding task in preview mode:", error);
      }
    } else {
      // Existing database logic
      try {
        const res = await fetch(`/api/blocks/${blockId}`, {
          method: "POST",
          body: JSON.stringify({ taskId: task._id }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to add task to block");
        }

        const data = await res.json();
        const { updatedBlock, updatedTask } = data;

        // Update local state
        setProjects((prevProjects: Project[]) =>
          prevProjects.map((project) => ({
            ...project,
            tasks: project.tasks.map((task) =>
              task._id === task._id ? { ...task, block: blockId } : task
            ),
          }))
        );

        setTasks((prevTasks: Task[]) =>
          prevTasks.map((task) => (task._id === task._id ? updatedTask : task))
        );
        onClose();

        updateDay();
      } catch (error) {
        console.error("Error adding task to block:", error);
      }
    }
  };

  const isTaskAssigned = (task: Task) => {
    if (isPreviewMode) {
      // Preview mode logic remains the same
      // ...
    } else {
      // First check if the task has a block assigned
      if (!task.block) return false;

      // Look for the block in the current day
      const currentDayBlock = day.blocks.find(
        (block: any) => block._id === task.block
      );

      // If we're in today's view
      if (!isTomorrow) {
        // Check if the task is assigned to a block in today's schedule
        const isAssignedToday = currentDayBlock
          ? currentDayBlock.status !== "complete"
          : false;

        // Also check if the task is assigned to tomorrow's schedule
        const isAssignedTomorrow = tomorrowSchedule?.blocks?.some(
          (block: any) => block._id === task.block
        );

        return isAssignedToday || isAssignedTomorrow;
      }

      // For tomorrow's view, check today's schedule for an incomplete block assignment
      if (isTomorrow && todaySchedule?.blocks) {
        const incompleteTaskBlock = todaySchedule.blocks.find(
          (block: any) =>
            block._id === task.block && block.status !== "complete"
        );
        if (incompleteTaskBlock) {
          return true;
        }
      }

      // Fallback: if the block exists in the current day, mark it as assigned
      return !!currentDayBlock;
    }
  };

  const handleNewTaskSubmit = async () => {
    if (!newTask.name || newTask.name.trim() === "") {
      setErrors((prev) => ({ ...prev, name: true }));
      return;
    }

    if (isPreviewMode) {
      console.log("are we in the preview mode.");
      try {
        // Generate temporary ID for preview mode
        const tempId = `preview-${Date.now()}`;

        const newTaskData = {
          _id: tempId,
          ...newTask,
          block: blockId,
          blockId: blockId,
          userId: userId,
          duration: newTask.duration,
        };

        console.log(newTaskData);
        console.log(localStorage);

        // Get current preview schedule with proper default structure
        const previewSchedule = JSON.parse(
          localStorage.getItem("schedule") ||
            JSON.stringify({
              currentTime: new Date().toLocaleTimeString(),
              scheduleRationale: "",
              userStartTime: "",
              userEndTime: "",
              blocks: [],
            })
        );
        console.log(previewSchedule);

        // Ensure blocks array exists
        if (!previewSchedule.blocks) {
          previewSchedule.blocks = [];
        }

        // Find and update the block
        const updatedBlocks = previewSchedule.blocks.map((block: any) => {
          if (block._id === blockId) {
            // Ensure block.tasks exists
            const currentTasks = Array.isArray(block.tasks) ? block.tasks : [];
            return {
              ...block,
              tasks: [...currentTasks, newTaskData],
            };
          }
          return block;
        });

        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        console.log("this is the updated Schedule", updatedSchedule);

        // Save to localStorage
        updatePreviewStorage(updatedSchedule);

        // Update UI state
        setPreviewSchedule(updatedSchedule);

        // Clear form
        setNewTask({
          name: "",
          description: "",
          duration: 5,
          isCustomDuration: false,
          completed: false,
          block: null,
          project: null,
          type: "deep-work",
          priority: "Medium",
          isRoutineTask: false,
        });

        onClose();
      } catch (error) {
        console.error("Error creating task in preview mode:", error);
        // toast.error("Failed to add task to preview schedule");
      }
    } else {
      // Existing database logic
      try {
        const taskData = {
          ...newTask,
          blockId: blockId,
          userId: userId,
          duration:
            newTask.duration === 0
              ? 0
              : Math.max(5, Math.min(240, newTask.duration)),
        };

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) throw new Error("Failed to create task");

        const data = await response.json();
        setTasks((prevTasks) => [...prevTasks, data.task]);

        // Clear form and close modal
        setNewTask({
          name: "",
          description: "",
          duration: 5,
        });

        onClose();
        updateDay();
      } catch (error) {
        console.error("Error creating new task:", error);
      }
    }
  };

  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 border rounded-md shadow-sm">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-blue-600" />
            <DialogTitle className="text-base font-medium">
              Add Task
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoadingSchedule && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading schedule...</span>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="newTask"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="newTask" className="flex-1">
                New Task
              </TabsTrigger>
              <TabsTrigger value="existingTask" className="flex-1">
                Task Bank
              </TabsTrigger>
              <TabsTrigger value="projectTask" className="flex-1">
                Project Task
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="newTask">
            <div className="space-y-4 py-4 px-6">
              <div className="space-y-2">
                <Input
                  id="task-name"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    Task name is required
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-duration">Duration</Label>
                <Select
                  value={
                    newTask.duration === 0
                      ? "0"
                      : newTask.isCustomDuration
                      ? "custom"
                      : newTask.duration?.toString() || "5"
                  }
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setNewTask({
                        ...newTask,
                        duration: 0,
                        isCustomDuration: true,
                      });
                    } else {
                      setNewTask({
                        ...newTask,
                        duration: parseInt(value),
                        isCustomDuration: false,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Can be done in parallel</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="custom">Custom duration...</SelectItem>
                  </SelectContent>
                </Select>

                {newTask.isCustomDuration && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min="1"
                      max="480"
                      value={newTask.duration || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 480) {
                          setNewTask({ ...newTask, duration: value });
                        }
                      }}
                      className="flex-1"
                      placeholder="Enter duration in minutes"
                    />
                    <span className="text-sm text-gray-500 w-16">minutes</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="existingTask">
            <div className="px-6">
              <ScrollArea className="h-72 w-full rounded-md border">
                {tasks.filter((task) => !task.completed).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] px-6">
                    <div className="rounded-full bg-blue-50 p-3 mb-4">
                      <ListTodo className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      No Tasks yet
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-6">
                      Create your first Task to add it to your schedule
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/tasks")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create an Task
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {tasks
                      .filter((task) => !task.completed)
                      .map((task) => (
                        <Card
                          key={task._id}
                          className={isTaskAssigned(task) ? "opacity-50" : ""}
                        >
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                {task.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {task.description}
                              </p>
                              <div className="flex items-center space-x-2">
                                {isTaskAssigned(task) && (
                                  <Badge variant="outline">
                                    {isTomorrow &&
                                    todaySchedule?.blocks.some(
                                      (b) => b._id === task.block
                                    )
                                      ? "Assigned Today"
                                      : "Assigned"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => addTaskToBlock(task)}
                              disabled={isTaskAssigned(task)}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              {isTaskAssigned(task) ? "Assigned" : "Add"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="projectTask">
            <div className="space-y-4 px-6 py-4">
              {projects.length === 0 ? (
                // Empty state for when there are no projects at all
                <div className="flex flex-col items-center justify-center h-[300px] px-6">
                  <div className="rounded-full bg-blue-50 p-3 mb-4">
                    <ListTodo className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Your Dont Have Any Projects
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Create your first Project to add it to your schedule
                  </p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push("/dashboard/projects")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create New Task
                  </Button>
                </div>
              ) : (
                // Only show the project selector and tasks if projects exist
                <>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project">
                        {projects.find((p) => p._id === selectedProject)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {projects
                        .filter((project) => !project.completed)
                        .map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="w-full border rounded-md">
                    <ScrollArea className="h-[400px]">
                      <div className="p-4 space-y-4">
                        {projects
                          .find((p) => p._id === selectedProject)
                          ?.tasks.filter((task) => task.completed === false)
                          .map((task) => (
                            <Card
                              key={task._id}
                              className={
                                isTaskAssigned(task) ? "opacity-50" : ""
                              }
                            >
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium leading-none">
                                    {task.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                      {task.priority}
                                    </Badge>
                                    {isTaskAssigned(task) && (
                                      <Badge variant="outline">
                                        {isTomorrow &&
                                        todaySchedule?.blocks.some(
                                          (b) => b._id === task.block
                                        )
                                          ? "Assigned Today"
                                          : "Assigned"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0"
                                  onClick={() => addTaskToBlock(task)}
                                  disabled={isTaskAssigned(task)}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  {isTaskAssigned(task) ? "Assigned" : "Add"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === "newTask" && (
            <Button
              onClick={handleNewTaskSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
