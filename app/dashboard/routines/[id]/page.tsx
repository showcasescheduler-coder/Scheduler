"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ListTodo,
  Menu,
  MoreVertical,
  Plus,
  Video,
  Brain,
  LayoutDashboard,
  FolderKanban,
  Repeat,
  BarChart2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SidebarContent } from "@/app/components/SideBar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserButton } from "@clerk/nextjs";
import MobileNav from "@/app/components/MobileNav";
import { format } from "date-fns";
import { Task } from "@/app/context/models";

interface Props {
  params: { id: string };
}

interface Routine {
  _id: string;
  name: string;
  description: string;
  days: string[];
  tasks: Task[];
  startTime: string;
  endTime: string;
  blockType?:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
}

// interface RoutineTask {
//   _id: string;
//   name: string;
//   description: string;
//   priority: string;
//   duration: number;
//   routineId: string;
//   type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
// }

export default function RoutineDetailsPage({ params: { id } }: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [routineFormErrors, setRoutineFormErrors] = useState({
    name: "",
    time: "",
    days: "",
  });

  const [newTaskFormErrors, setNewTaskFormErrors] = useState({
    name: "",
  });

  const [editTaskFormErrors, setEditTaskFormErrors] = useState({
    name: "",
  });
  const router = useRouter();

  const [newTask, setNewTask] = useState<Partial<Task>>({
    duration: 5,
  });

  useEffect(() => {
    const fetchRoutine = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/routines/${id}`);
        if (!response.ok) throw new Error("Failed to fetch routine");
        const data = await response.json();
        setRoutine(data);
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast.error("Failed to load routine");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, [id]);

  const handleSave = async () => {
    if (!routine) return;

    // Reset form errors
    setRoutineFormErrors({
      name: "",
      time: "",
      days: "",
    });

    // Validate form
    let isValid = true;
    const newErrors = {
      name: "",
      time: "",
      days: "",
    };

    // Name is required
    if (!routine.name.trim()) {
      newErrors.name = "Routine name is required";
      isValid = false;
    }

    // Start time and end time validation
    if (!routine.startTime) {
      newErrors.time = "Start time is required";
      isValid = false;
    } else if (!routine.endTime) {
      newErrors.time = "End time is required";
      isValid = false;
    } else if (routine.startTime >= routine.endTime) {
      newErrors.time = "End time must be after start time";
      isValid = false;
    }

    // At least one day must be selected
    if (routine.days.length === 0) {
      newErrors.days = "Please select at least one day";
      isValid = false;
    }

    // If validation fails, update errors and return
    if (!isValid) {
      setRoutineFormErrors(newErrors);
      return;
    }

    // Continue with saving routine if validation passes
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routine),
      });

      if (!response.ok) throw new Error("Failed to update routine");
      toast.success("Routine updated successfully");
    } catch (error) {
      console.error("Error updating routine:", error);
      toast.error("Failed to update routine");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoutine((prev) => (prev ? { ...prev, [name]: value } : null));

    // Clear errors when field changes
    if (routineFormErrors[name as keyof typeof routineFormErrors]) {
      setRoutineFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear time error when either time input changes
    if (
      (name === "startTime" || name === "endTime") &&
      routineFormErrors.time
    ) {
      setRoutineFormErrors((prev) => ({
        ...prev,
        time: "",
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setRoutine((prev) => {
      if (!prev) return null;
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });

    // Clear days error when toggling days
    if (routineFormErrors.days) {
      setRoutineFormErrors((prev) => ({
        ...prev,
        days: "",
      }));
    }
  };

  const handleAddTask = async () => {
    if (!routine) return;

    // Reset form errors
    setNewTaskFormErrors({ name: "" });

    // Validate task name
    if (!newTask.name || !newTask.name.trim()) {
      setNewTaskFormErrors({ name: "Task name is required" });
      return;
    }

    try {
      const response = await fetch(`/api/routines/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const updatedRoutine = await response.json();
      setRoutine(updatedRoutine);
      setNewTask({ duration: 5 });
      setIsTaskDialogOpen(false);
      toast.success("Task was added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !routine) return;

    // Reset form errors
    setEditTaskFormErrors({ name: "" });

    // Validate task name
    if (!editingTask.name || !editingTask.name.trim()) {
      setEditTaskFormErrors({ name: "Task name is required" });
      return;
    }

    try {
      const response = await fetch(
        `/api/edit-routine-task/${editingTask._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingTask,
            routineId: routine._id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update task");

      const result = await response.json();
      setRoutine((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((task) =>
            task._id === editingTask._id ? result.updatedTask : task
          ),
        };
      });

      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!routine || !confirm("Are you sure you want to delete this task?"))
      return;

    try {
      const response = await fetch(`/api/delete-task-from-routine/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineId: routine._id }),
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setRoutine((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.filter((task) => task._id !== taskId),
        };
      });
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleNewTaskInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && newTaskFormErrors.name) {
      setNewTaskFormErrors({ name: "" });
    }
  };

  // Add this near handleUpdateTask or editingTask state
  const handleEditTaskInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingTask((prev) => (prev ? { ...prev, [name]: value } : null));

    if (name === "name" && editTaskFormErrors.name) {
      setEditTaskFormErrors({ name: "" });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (!routine) return <div>Routine not found</div>;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-gray-200">
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

              <div className="text-sm font-medium">
                {format(new Date(), "MMM d, yyyy")}
              </div>

              <UserButton />
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2 shrink-0"
                onClick={() => router.push("/dashboard/routines")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold truncate">
                    {routine.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {routine.startTime} - {routine.endTime}
                    </span>
                    <span className="text-xs text-gray-500">
                      {routine.days.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          routine.blockType === "deep-work"
                            ? "bg-blue-500"
                            : routine.blockType === "break"
                            ? "bg-green-500"
                            : routine.blockType === "meeting"
                            ? "bg-purple-500"
                            : routine.blockType === "health"
                            ? "bg-pink-500"
                            : routine.blockType === "exercise"
                            ? "bg-orange-500"
                            : routine.blockType === "admin"
                            ? "bg-gray-500"
                            : routine.blockType === "personal"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500 capitalize">
                        {(routine.blockType || "deep-work").replace("-", " ")}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="ml-4 shrink-0"
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
                  onClick={() => router.push("/dashboard/routines")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">
                    {routine.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {routine.startTime} - {routine.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {routine.days.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            routine.blockType === "deep-work"
                              ? "#9333ea" // purple-600
                              : routine.blockType === "break"
                              ? "#16a34a" // green-600
                              : routine.blockType === "meeting"
                              ? "#0284c7" // sky-600
                              : routine.blockType === "health"
                              ? "#0d9488" // teal-600
                              : routine.blockType === "exercise"
                              ? "#059669" // emerald-600
                              : routine.blockType === "admin"
                              ? "#4b5563" // gray-600
                              : routine.blockType === "personal"
                              ? "#c026d3" // fuchsia-600
                              : "#9333ea", // Default (purple-600)
                        }}
                      ></div>
                      <span className="text-sm text-gray-500 capitalize">
                        {(routine.blockType || "deep-work").replace("-", " ")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <ListTodo className="h-4 w-4 text-blue-500" />
                          Routine Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          name="name"
                          value={routine.name}
                          onChange={handleInputChange}
                          className={`mt-2 ${
                            routineFormErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {routineFormErrors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {routineFormErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Brain className="h-4 w-4 text-blue-500" />
                          Description
                        </Label>
                        <Textarea
                          name="description"
                          value={routine.description}
                          onChange={handleInputChange}
                          className="mt-2 min-h-[120px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Start Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="startTime"
                            type="time"
                            value={routine.startTime}
                            onChange={handleInputChange}
                            className={`mt-2 ${
                              routineFormErrors.time ? "border-red-500" : ""
                            }`}
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" />
                            End Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="endTime"
                            type="time"
                            value={routine.endTime}
                            onChange={handleInputChange}
                            className={`mt-2 ${
                              routineFormErrors.time ? "border-red-500" : ""
                            }`}
                          />
                        </div>
                        {routineFormErrors.time && (
                          <p className="text-sm text-red-500 col-span-2">
                            {routineFormErrors.time}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Recurring Days <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-4 mt-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <div
                              key={day}
                              className="flex flex-col items-center"
                            >
                              <Label htmlFor={day} className="mb-1 text-xs">
                                {day.slice(0, 3)}
                              </Label>
                              <Checkbox
                                id={day}
                                checked={routine.days.includes(day)}
                                onCheckedChange={() => handleDayToggle(day)}
                                className="text-blue-500 border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                        {routineFormErrors.days && (
                          <p className="text-sm text-red-500 mt-1">
                            {routineFormErrors.days}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <FolderKanban className="h-4 w-4 text-blue-500" />
                          Block Type
                        </Label>
                        <Select
                          value={routine.blockType || "deep-work"}
                          onValueChange={(value) => {
                            setRoutine((prev) => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                blockType: value as
                                  | "deep-work"
                                  | "break"
                                  | "meeting"
                                  | "health"
                                  | "exercise"
                                  | "admin"
                                  | "personal",
                              };
                            });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select block type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deep-work">
                              <span style={{ color: "#9333ea" }}>
                                Deep Work
                              </span>
                            </SelectItem>
                            <SelectItem value="break">
                              <span style={{ color: "#16a34a" }}>Break</span>
                            </SelectItem>
                            <SelectItem value="meeting">
                              <span style={{ color: "#0284c7" }}>Meeting</span>
                            </SelectItem>
                            <SelectItem value="health">
                              <span style={{ color: "#0d9488" }}>Health</span>
                            </SelectItem>
                            <SelectItem value="exercise">
                              <span style={{ color: "#059669" }}>Exercise</span>
                            </SelectItem>
                            <SelectItem value="admin">
                              <span style={{ color: "#4b5563" }}>Admin</span>
                            </SelectItem>
                            <SelectItem value="personal">
                              <span style={{ color: "#c026d3" }}>Personal</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Desktop Delete Card */}
                <Card className="border-red-200 hidden md:block">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-red-600">
                          Delete Routine
                        </h3>
                        <p className="text-sm text-gray-500">
                          Permanently delete this routine and all its tasks
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this routine? This action cannot be undone."
                            )
                          ) {
                            router.push("/dashboard/routines");
                          }
                        }}
                      >
                        Delete Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Tasks</h2>
                      <Dialog
                        open={isTaskDialogOpen}
                        onOpenChange={setIsTaskDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="rounded-lg border min-w-[300px] md:min-w-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>

                              <TableHead className="hidden md:table-cell">
                                Duration
                              </TableHead>

                              <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {routine.tasks.map((task) => (
                              <TableRow key={task._id}>
                                <TableCell className="font-medium">
                                  <div>
                                    <div>{task.name}</div>
                                    <div className="md:hidden text-sm text-gray-500">
                                      {task.duration} min
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell className="hidden md:table-cell">
                                  {task.duration} min
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setEditingTask(task);
                                          setIsEditTaskDialogOpen(true);
                                        }}
                                      >
                                        <span>Edit Task</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onSelect={() =>
                                          handleDeleteTask(task._id)
                                        }
                                        className="text-red-600"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {routine.tasks.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-6 text-sm text-gray-500"
                                >
                                  <ListTodo className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  No tasks added yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Mobile Delete Card */}
                <Card className="border-red-200 md:hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-red-600">
                          Delete Routine
                        </h3>
                        <p className="text-sm text-gray-500">
                          Permanently delete this routine and all its tasks
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this routine? This action cannot be undone."
                            )
                          ) {
                            router.push("/dashboard/routines");
                          }
                        }}
                      >
                        Delete Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Task Dialogs - Keep these unchanged */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your routine
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    name="name"
                    value={newTask.name || ""}
                    onChange={handleNewTaskInputChange}
                    className={`${
                      newTaskFormErrors.name ? "border-red-500" : ""
                    }`}
                  />
                  {newTaskFormErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {newTaskFormErrors.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTask.description || ""}
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
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditTaskDialogOpen}
          onOpenChange={(open) => {
            setIsEditTaskDialogOpen(open);
            if (!open) setEditingTask(null);
          }}
        >
          {editingTask && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>Modify the task details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-name"
                      name="name"
                      value={editingTask.name}
                      onChange={handleEditTaskInputChange}
                      className={`col-span-3 ${
                        editTaskFormErrors.name ? "border-red-500" : ""
                      }`}
                    />
                    {editTaskFormErrors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {editTaskFormErrors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
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
                          setEditingTask({
                            ...editingTask,
                            duration: 0,
                            isCustomDuration: true,
                          });
                        } else {
                          setEditingTask({
                            ...editingTask,
                            duration: parseInt(value),
                            isCustomDuration: false,
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="edit-task-duration" className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          Can be done in parallel
                        </SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="custom">
                          Custom duration...
                        </SelectItem>
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
                              setEditingTask({
                                ...editingTask,
                                duration: value,
                              });
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
                  onClick={handleUpdateTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Task
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
}
