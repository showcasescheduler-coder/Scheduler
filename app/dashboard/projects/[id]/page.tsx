"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Plus,
  MoreHorizontal,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  Menu,
  ChevronDown,
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isBefore } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarContent } from "@/app/components/SideBar";
import { useAppContext } from "@/app/context/AppContext";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Project } from "@/app/context/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import MobileNav from "@/app/components/MobileNav";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortableTaskRow from "@/app/components/SortableTaskRow";
import MobileSortableTaskRow from "@/app/components/MobileSortableTaskRow";

interface Props {
  params: { id: string };
}

interface Task {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  duration: number;
  deadline: string;
  completed: boolean;
  projectId: string;
  status?: string; // Make status optional
  type?: "deep-work" | "planning" | "break" | "admin" | "collaboration"; // Make
}

export default function ProjectDetails({ params: { id } }: Props) {
  // KEEP - Project context
  const { projects, setProjects } = useAppContext();
  const [project, setProject] = useState<Project | null>(null);
  const [updatingTasks, setUpdatingTasks] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // KEEP - Task dialog and AI generation states
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [activeTab, setActiveTab] = useState("incomplete");
  const [isGenerateTasksDialogOpen, setIsGenerateTasksDialogOpen] =
    useState(false);
  const [thoughts, setThoughts] = useState([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // KEEP - Router and Auth
  const router = useRouter();
  const { userId } = useAuth();

  // KEEP - Task states
  const [newTask, setNewTask] = useState<Partial<Task>>({
    duration: 5,
  });

  // KEEP - Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!userId) return;
      try {
        const projectFromState = projects.find((p) => p._id === id);
        if (projectFromState) {
          setProject(projectFromState);
        } else {
          const response = await fetch(`/api/projects/${id}`);
          if (!response.ok) throw new Error("Failed to fetch project");
          const data = await response.json();
          setProject(data);
          setProjects((prev) => [...prev, data]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchProjectDetails();
  }, [id, userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (project?.completed) return; // Early return if project is completed
    const { name, value } = e.target;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handlePriorityChange = (value: string) => {
    if (project?.completed) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        priority: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
      };
    });
  };

  const handleSave = async () => {
    if (!project) return;
    console.log("this ran");
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error("Failed to update");
      const updatedProject = await response.json();
      console.log(updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? updatedProject : p))
      );
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddTask = async () => {
    if (!project || !newTask.name || project.completed) return;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          projectId: project._id,
          status: "Todo",
          priority: project.priority,
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      const result = await response.json();

      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: [...prev.tasks, result.task],
        } as Project;
      });

      setNewTask({ duration: 5 });
      setIsTaskDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGenerateTasks = async () => {
    if (!project || project.tasks.length > 0) return;
    setGeneratingTasks(true);
    try {
      const cleanThoughts = thoughts
        .filter((thought) => thought.trim() !== "")
        .join("\n");

      const response = await fetch("/api/generateTasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            name: project.name,
            description: project.description,
            deadline: format(new Date(project.deadline), "yyyy-MM-dd"),
          },
          context: cleanThoughts,
          today: new Date().toISOString().split("T")[0],
        }),
      });
      if (!response.ok) throw new Error("Failed to generate tasks");
      const tasksData = await response.json();

      const saveResponse = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasksData.map((task: any) => ({
            ...task,
            projectId: project._id,
          })),
          projectId: project._id,
        }),
      });
      if (!saveResponse.ok) throw new Error("Failed to save tasks");
      const savedTasks = await saveResponse.json();

      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: [...prev.tasks, ...savedTasks.tasks],
        } as Project;
      });

      setIsGenerateTasksDialogOpen(false);
      setThoughts([""]); // Add it here
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGeneratingTasks(false);
    }
  };

  const getFilteredTasks = (): Task[] => {
    if (!project) return [];
    return project.tasks.filter((task) =>
      activeTab === "completed" ? task.completed : !task.completed
    );
  };

  // Function to sort tasks by deadline
  const sortTasksByDeadline = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return isBefore(parseISO(a.deadline), parseISO(b.deadline)) ? -1 : 1;
    });
  };

  const allTasksCompleted = (project: Project) => {
    return (
      project.tasks.length > 0 && project.tasks.every((task) => task.completed)
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // Handle task updates
  const handleUpdateTask = async () => {
    if (!editingTask || !project) return;

    try {
      const response = await fetch(`/api/projects/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingTask,
          projectId: project._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");
      const result = await response.json();

      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((task) =>
            task._id === editingTask._id ? result.updatedTask : task
          ),
        } as Project;
      });

      setIsEditDialogOpen(false); // Changed from setIsEditTaskDialogOpen
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string, projectId: string) => {
    if (!project || project.completed || !confirm("Delete this task?")) return;

    try {
      const response = await fetch(`/api/projects/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.filter((task) => task._id !== taskId),
        } as Project;
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCompleteProject = async (): Promise<void> => {
    // Remove the completion check if we're reactivating
    if (!project || (!project.completed && !allTasksCompleted(project))) return;

    try {
      const response = await fetch(`/api/complete-project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: project._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle project completion");
      const { project: updatedProject } = await response.json();

      // Update local state
      setProjects((prev: Project[]) =>
        prev.map((p: Project) =>
          p._id === updatedProject._id ? updatedProject : p
        )
      );

      // Update the local project state
      setProject(updatedProject);

      // Only redirect if we're completing the project, not reactivating
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error toggling project completion:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    // Show confirmation alert
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone and all associated tasks will be deleted."
    );

    // If user didn't confirm, exit early
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/delete-project`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project._id }),
      });

      if (!response.ok) throw new Error("Failed to delete project");

      // Remove the project from local state
      setProjects((prev) => prev.filter((p) => p._id !== project._id));

      // Navigate back to projects page
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!project || project.completed) return;

    // Store the current state for potential rollback
    const previousProject = { ...project };
    const previousProjects = [...projects];

    try {
      // Optimistically update local state
      const updatedTasks = project.tasks.map((task) =>
        task._id === taskId ? { ...task, completed } : task
      );
      const optimisticProject = { ...project, tasks: updatedTasks };

      // Update local state
      setProject(optimisticProject);
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? optimisticProject : p))
      );

      // Make the API call with ID in the body
      const response = await fetch(`/api/complete-project-task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          completed,
          projectId: project._id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update task. Status: ${response.statusText}`
        );
      }

      // Handle API response
      const { success, updatedTask, updatedProject } = await response.json();

      if (!success) {
        throw new Error("Server returned unsuccessful status");
      }

      // Update with server response
      setProject(updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
    } catch (error) {
      // Revert to previous state on error
      console.error("Error updating task completion status:", error);
      setProject(previousProject);
      setProjects(previousProjects);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !project) return;

    // Store previous state for rollback
    const previousProject = { ...project };
    const previousProjects = [...projects];

    try {
      // Calculate the new task order first
      const oldIndex = project.tasks.findIndex(
        (task) => task._id === active.id
      );
      const newIndex = project.tasks.findIndex((task) => task._id === over.id);

      const newTasks = [...project.tasks];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);

      // Get the new order of task IDs from our calculated array
      const updatedTaskOrder = newTasks.map((task) => task._id);

      // Optimistically update the UI with our calculated array
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: newTasks,
        } as Project;
      });

      // Send the update to the server using our pre-calculated order
      const response = await fetch("/api/reorder-project-tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project._id,
          taskIds: updatedTaskOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task order");
      }

      const { project: updatedProject } = await response.json();

      // Update both project states with server response
      setProject(updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
    } catch (error) {
      console.error("Error updating task order:", error);
      // Revert to previous state if there's an error
      setProject(previousProject);
      setProjects(previousProjects);
    }
  };

  if (!project) return null;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-gray-200">
          {/* Top bar with menu and user */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
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

              {/* Center: Date display */}
              <div className="text-sm font-medium">
                {format(new Date(), "MMM d, yyyy")}
              </div>

              {/* Right: User button */}
              <UserButton />
            </div>
          </div>

          {/* Project info bar */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2 shrink-0"
                onClick={() => router.push("/dashboard/projects")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold truncate">
                    {project.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {project.completed ? "Completed" : "In Progress"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due{" "}
                      {project.deadline
                        ? format(new Date(project.deadline), "MMM dd, yyyy")
                        : "Not set"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={project.completed}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:block border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard/projects")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      {project.name}
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {project.completed ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={project.completed}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteProject}
                >
                  Delete Project
                </Button>
                <Button
                  size="sm"
                  onClick={handleCompleteProject}
                  disabled={!project.completed && !allTasksCompleted(project)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {project.completed
                    ? "Reactivate Project"
                    : "Complete Project"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Split View Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column - Project Details */}
          <div className="w-full md:w-1/2 overflow-y-auto border-r border-gray-200">
            <div className="p-4 md:p-6 space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Overall Progress</span>
                      <span className="font-medium">
                        {project.tasks.length > 0
                          ? `${Math.round(
                              (project.tasks.filter((t) => t.completed).length /
                                project.tasks.length) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width:
                            project.tasks.length > 0
                              ? `${
                                  (project.tasks.filter((t) => t.completed)
                                    .length /
                                    project.tasks.length) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {project.tasks.filter((t) => t.completed).length}/
                        {project.tasks.length} tasks completed
                      </span>
                      <span>
                        Due{" "}
                        {project.deadline
                          ? format(new Date(project.deadline), "MMM dd, yyyy")
                          : "Not set"}
                      </span>
                    </div>
                  </div>
                  {project.tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t md:hidden">
                      <Button
                        onClick={handleCompleteProject}
                        disabled={
                          !project.completed && !allTasksCompleted(project)
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {project.completed
                          ? "Reactivate Project"
                          : "Complete Project"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteProject}
                        className="w-full text-white mt-2"
                      >
                        Delete Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project Details Form */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Project Name
                      </label>
                      <Input
                        name="name"
                        className="mt-2"
                        value={project.name}
                        onChange={handleInputChange}
                        disabled={project.completed}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        name="description"
                        className="mt-2"
                        value={project.description}
                        onChange={handleInputChange}
                        disabled={project.completed}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="date"
                          name="deadline"
                          className="flex-1"
                          value={
                            project.deadline
                              ? format(new Date(project.deadline), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={handleInputChange}
                          disabled={project.completed}
                        />
                        {/* <Button variant="outline" size="icon">
                          <Calendar className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select
                          value={
                            project.priority
                              ? project.priority.charAt(0).toUpperCase() +
                                project.priority.slice(1)
                              : "Medium"
                          }
                          onValueChange={handlePriorityChange}
                          disabled={project.completed}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Mobile-only Tasks Section */}
              <div className="md:hidden">
                <Card className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription>
                      Manage tasks associated with this project
                    </CardDescription>
                    <div className="flex flex-col gap-4 mt-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="incomplete">
                            Incomplete
                          </TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      {activeTab !== "completed" && (
                        <Button
                          onClick={() => setIsGenerateTasksDialogOpen(true)}
                          disabled={generatingTasks}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {generatingTasks ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Generate Tasks
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">
                                <div className="flex items-center gap-2">
                                  <span>Order</span>
                                </div>
                              </TableHead>
                              <TableHead className="w-[50px]">Done</TableHead>
                              <TableHead className="w-[60%]">Task</TableHead>
                              {/* <TableHead className="w-[25%]">Due Date</TableHead> */}
                              <TableHead className="w-[15%] text-center">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <SortableContext
                              items={getFilteredTasks().map((task) => task._id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {getFilteredTasks().map((task, index) => (
                                <MobileSortableTaskRow
                                  key={task._id}
                                  task={task}
                                  index={index}
                                  project={project}
                                  onComplete={handleTaskCompletion}
                                  onDelete={handleDeleteTask}
                                  onEdit={handleEditTask}
                                />
                                //   <TableRow key={task._id}>
                                //     <TableCell>
                                //       <div className="flex items-center gap-2">
                                //         <GripVertical className="h-4 w-4 text-gray-400" />
                                //         <span className="text-sm text-gray-500">
                                //           {index + 1}
                                //         </span>
                                //       </div>
                                //     </TableCell>
                                //     <TableCell>
                                //       <Checkbox
                                //         checked={task.completed}
                                //         onCheckedChange={(
                                //           checked: boolean | string
                                //         ) =>
                                //           handleTaskCompletion(
                                //             task._id,
                                //             checked === true
                                //           )
                                //         }
                                //         disabled={project.completed}
                                //         className="ml-2"
                                //       />
                                //     </TableCell>
                                //     <TableCell className="py-3">
                                //       <div className="space-y-1">
                                //         <div className="font-medium">
                                //           {task.name}
                                //         </div>
                                //         {task.description && (
                                //           <div className="text-sm text-gray-500 truncate max-w-[280px]">
                                //             {task.description}
                                //           </div>
                                //         )}
                                //       </div>
                                //     </TableCell>
                                //     {/* <TableCell className="align-top py-3">
                                //   <div className="text-sm font-medium">
                                //     {format(parseISO(task.deadline), "MMM dd")}
                                //   </div>
                                // </TableCell> */}
                                //     <TableCell className="text-center">
                                //       <DropdownMenu modal={false}>
                                //         <DropdownMenuTrigger asChild>
                                //           <Button
                                //             variant="ghost"
                                //             size="icon"
                                //             className="h-8 w-8"
                                //             disabled={project.completed}
                                //           >
                                //             <MoreHorizontal className="h-4 w-4" />
                                //           </Button>
                                //         </DropdownMenuTrigger>
                                //         <DropdownMenuContent align="end">
                                //           <DropdownMenuItem
                                //             onSelect={(e) => {
                                //               e.preventDefault();
                                //               setEditingTask(task);
                                //               setIsEditDialogOpen(true);
                                //             }}
                                //           >
                                //             <Edit className="mr-2 h-4 w-4" />
                                //             <span>Edit Task</span>
                                //           </DropdownMenuItem>
                                //           <DropdownMenuItem
                                //             onSelect={() =>
                                //               handleDeleteTask(
                                //                 task._id,
                                //                 project._id
                                //               )
                                //             }
                                //           >
                                //             <Trash2 className="mr-2 h-4 w-4" />
                                //             <span>Delete Task</span>
                                //           </DropdownMenuItem>
                                //         </DropdownMenuContent>
                                //       </DropdownMenu>
                                //     </TableCell>
                                //   </TableRow>
                              ))}
                            </SortableContext>
                          </TableBody>
                        </Table>
                      </DndContext>
                    </div>
                  </CardContent>

                  <CardFooter className="justify-center border-t p-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => setIsTaskDialogOpen(true)}
                      disabled={project.completed}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Task
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="hidden md:block w-full md:w-1/2 overflow-y-auto bg-gray-50">
            <div className="p-4 md:p-6 space-y-4">
              {/* Header with Actions */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Tasks</h2>
                  <p className="text-sm text-gray-500">
                    Manage your project tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsTaskDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={project.completed}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsGenerateTasksDialogOpen(true)}
                    disabled={
                      generatingTasks ||
                      project.tasks.length > 0 ||
                      project.completed
                    }
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-white rounded-md p-1 border border-gray-200 flex">
                  <button
                    onClick={() => setActiveTab("incomplete")}
                    className={`px-4 py-2 text-sm rounded-md ${
                      activeTab === "incomplete"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Incomplete (
                    {project.tasks.filter((t) => !t.completed).length})
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-2 text-sm rounded-md ${
                      activeTab === "completed"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Completed ({project.tasks.filter((t) => t.completed).length}
                    )
                  </button>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="bg-white rounded-md border border-gray-200">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">
                          <div className="flex items-center gap-2">
                            <span>Order</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[50px]">Done</TableHead>
                        <TableHead className="w-[300px]">Task</TableHead>
                        {/* <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead> */}
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext
                        items={getFilteredTasks().map((task) => task._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {getFilteredTasks().map((task, index) => (
                          <SortableTaskRow
                            key={task._id}
                            task={task}
                            index={index}
                            project={project}
                            onComplete={handleTaskCompletion}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                          />
                          // <TableRow key={task._id}>
                          //   <TableCell>
                          //     <div className="flex items-center gap-2">
                          //       <GripVertical className="h-4 w-4 text-gray-400" />
                          //       <span className="text-sm text-gray-500">
                          //         {index + 1}
                          //       </span>
                          //     </div>
                          //   </TableCell>
                          //   <TableCell>
                          //     <Checkbox
                          //       checked={task.completed}
                          //       onCheckedChange={(checked: boolean | string) =>
                          //         handleTaskCompletion(task._id, checked === true)
                          //       }
                          //       className="ml-2"
                          //     />
                          //   </TableCell>
                          //   <TableCell>
                          //     <div>
                          //       <div className="font-medium">{task.name}</div>
                          //       {task.description && (
                          //         <div className="text-sm text-gray-500 truncate max-w-[280px]">
                          //           {task.description}
                          //         </div>
                          //       )}
                          //     </div>
                          //   </TableCell>
                          //   <TableCell>
                          //     <div className="text-sm">
                          //       {format(parseISO(task.deadline), "MMM dd")}
                          //     </div>
                          //   </TableCell>
                          //   <TableCell>
                          //     <span
                          //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          //         task.priority === "High"
                          //           ? "bg-red-100 text-red-800"
                          //           : task.priority === "Medium"
                          //           ? "bg-yellow-100 text-yellow-800"
                          //           : "bg-green-100 text-green-800"
                          //       }`}
                          //     >
                          //       {task.priority}
                          //     </span>
                          //   </TableCell>
                          //   <TableCell>
                          //     <div className="text-sm text-gray-500">
                          //       {task.duration}m
                          //     </div>
                          //   </TableCell>
                          //   <TableCell className="text-right">
                          //     <DropdownMenu modal={false}>
                          //       <DropdownMenuTrigger asChild>
                          //         <Button
                          //           variant="ghost"
                          //           size="icon"
                          //           className="h-8 w-8"
                          //         >
                          //           <MoreHorizontal className="h-4 w-4" />
                          //         </Button>
                          //       </DropdownMenuTrigger>
                          //       <DropdownMenuContent align="end">
                          //         <DropdownMenuItem
                          //           onSelect={(e) => {
                          //             e.preventDefault();
                          //             setEditingTask(task);
                          //             setIsEditDialogOpen(true);
                          //           }}
                          //         >
                          //           <Edit className="mr-2 h-4 w-4" />
                          //           <span>Edit Task</span>
                          //         </DropdownMenuItem>
                          //         <DropdownMenuItem
                          //           onSelect={() =>
                          //             handleDeleteTask(task._id, project._id)
                          //           }
                          //         >
                          //           <Trash2 className="mr-2 h-4 w-4" />
                          //           <span>Delete Task</span>
                          //         </DropdownMenuItem>
                          //       </DropdownMenuContent>
                          //     </DropdownMenu>
                          //   </TableCell>
                          // </TableRow>
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Tasks Dialog */}
      <Dialog
        open={isGenerateTasksDialogOpen}
        onOpenChange={setIsGenerateTasksDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Project Tasks</DialogTitle>
            <DialogDescription>
              What would you like to accomplish with these tasks?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border-2 border-[#e2e8f0] p-6 bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-200 min-h-[150px]">
            {thoughts.map((thought, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-blue-600 mt-1 text-lg">•</span>
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={thought}
                  onChange={(e) => {
                    const newThoughts = [...thoughts];
                    newThoughts[index] = e.target.value;
                    setThoughts(newThoughts);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const newThoughts = [...thoughts];
                      newThoughts.splice(index + 1, 0, "");
                      setThoughts(newThoughts);
                      setTimeout(() => {
                        if (inputRefs.current[index + 1]) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }, 0);
                    } else if (
                      e.key === "Backspace" &&
                      thoughts[index] === "" &&
                      thoughts.length > 1
                    ) {
                      e.preventDefault();
                      const newThoughts = thoughts.filter(
                        (_, i) => i !== index
                      );
                      setThoughts(newThoughts);
                      setTimeout(() => {
                        const prevInput =
                          inputRefs.current[Math.max(0, index - 1)];
                        if (prevInput) {
                          prevInput.focus();
                        }
                      }, 0);
                    }
                  }}
                  placeholder={
                    index === 0
                      ? "What tasks would you like to generate..."
                      : "Add another thought..."
                  }
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-md w-full text-lg placeholder:text-gray-400 bg-transparent"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleGenerateTasks}
              disabled={generatingTasks}
            >
              {generatingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Enter the details for the new task.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-name" className="text-right">
                Name
              </Label>
              <Input
                id="task-name"
                value={newTask.name}
                onChange={(e) =>
                  setNewTask({ ...newTask, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="task-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3 min-h-[100px]"
                placeholder="Enter task description..."
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="task-duration" className="text-right pt-2">
                Duration
              </Label>
              <div className="col-span-3 space-y-2">
                <Select
                  value={
                    newTask.isCustomDuration
                      ? "custom"
                      : newTask.duration?.toString() || "0"
                  }
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setNewTask({
                        ...newTask,
                        duration: 0, // Reset duration to 0 when switching to custom
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
                  <SelectTrigger id="task-duration" className="w-full">
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
                  <div className="flex items-center gap-2">
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
          </div>

          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddTask}
              disabled={project.completed}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        {editingTask && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the details of your task below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingTask.name || ""}
                  onChange={(e) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="col-span-3 min-h-[100px]"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-duration" className="text-right pt-2">
                  Duration
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    value={
                      editingTask.isCustomDuration
                        ? "custom"
                        : editingTask.duration?.toString() || "0"
                    }
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setEditingTask((prev) =>
                          prev
                            ? {
                                ...prev,
                                duration: 0,
                                isCustomDuration: true,
                              }
                            : null
                        );
                      } else {
                        setEditingTask((prev) =>
                          prev
                            ? {
                                ...prev,
                                duration: parseInt(value),
                                isCustomDuration: false,
                              }
                            : null
                        );
                      }
                    }}
                  >
                    <SelectTrigger id="edit-task-duration" className="w-full">
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

                  {editingTask.isCustomDuration && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="480"
                        value={editingTask.duration || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 480) {
                            setEditingTask((prev) =>
                              prev ? { ...prev, duration: value } : null
                            );
                          }
                        }}
                        className="flex-1"
                        placeholder="Enter duration in minutes"
                      />
                      <span className="text-sm text-gray-500 w-16">
                        minutes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpdateTask}
              >
                Update Task
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
