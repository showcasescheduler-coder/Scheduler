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

interface Props {
  params: { id: string };
}

interface Routine {
  _id: string;
  name: string;
  description: string;
  days: string[];
  tasks: RoutineTask[];
  startTime: string;
  endTime: string;
}

interface RoutineTask {
  _id: string;
  name: string;
  description: string;
  priority: string;
  duration: number;
  routineId: string;
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
}

export default function RoutineDetailsPage({ params: { id } }: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const router = useRouter();

  const [newTask, setNewTask] = useState<Partial<RoutineTask>>({
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
  };

  const handleDayToggle = (day: string) => {
    setRoutine((prev) => {
      if (!prev) return null;
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  const handleAddTask = async () => {
    if (!routine || !newTask.name || !newTask.duration) return;

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
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleEditTask = (task: RoutineTask) => {
    setEditingTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !routine) return;

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
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-16 p-0">
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => router.push("/dashboard/routines")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">
                    {routine.name}
                  </h1>
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

        {/* Info Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 md:px-8 py-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  {routine.startTime} - {routine.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>{routine.days.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Routine Details */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <ListTodo className="h-4 w-4 text-blue-500" />
                          Routine Name
                        </Label>
                        <Input
                          name="name"
                          value={routine.name}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
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

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Start Time
                          </Label>
                          <Input
                            name="startTime"
                            type="time"
                            value={routine.startTime}
                            onChange={handleInputChange}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" />
                            End Time
                          </Label>
                          <Input
                            name="endTime"
                            type="time"
                            value={routine.endTime}
                            onChange={handleInputChange}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Recurring Days
                        </Label>
                        <div className="grid grid-cols-7 gap-4 mt-2">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delete Section */}
                <Card className="border-red-200">
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

              {/* Right Column - Tasks */}
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

                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routine.tasks.map((task) => (
                            <TableRow key={task._id}>
                              <TableCell className="font-medium">
                                {task.name}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                                    task.type === "deep-work"
                                      ? "bg-purple-100 text-purple-800"
                                      : task.type === "planning"
                                      ? "bg-blue-100 text-blue-800"
                                      : task.type === "break"
                                      ? "bg-green-100 text-green-800"
                                      : task.type === "admin"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-pink-100 text-pink-800"
                                  }`}
                                >
                                  {task.type
                                    .split("-")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </span>
                              </TableCell>
                              <TableCell>{task.duration} min</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                                    task.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : task.priority === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditTask(task)}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteTask(task._id)}
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Task Dialogs - Keep these unchanged */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            {/* Keep existing dialog content unchanged */}
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your routine
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  value={newTask.name || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={240}
                    value={newTask.duration || 5}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        duration: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="type">Task Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewTask({
                        ...newTask,
                        type: value as RoutineTask["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deep-work">Deep Work</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="collaboration">
                        Collaboration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditTaskDialogOpen}
          onOpenChange={setIsEditTaskDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Modify the task details</DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Task Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTask.name}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min={5}
                      max={240}
                      value={editingTask.duration}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          duration: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value) =>
                        setEditingTask({ ...editingTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor="edit-type">Task Type</Label>
                    <Select
                      value={editingTask.type}
                      onValueChange={(value) =>
                        setEditingTask({
                          ...editingTask,
                          type: value as RoutineTask["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deep-work">Deep Work</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="collaboration">
                          Collaboration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleUpdateTask}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
