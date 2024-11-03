"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, PlusCircle, MoreVertical } from "lucide-react";
import { useAppContext } from "@/app/context/AppContext";
import { Routine, RoutineTask } from "@/app/context/models";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  params: { id: string };
}

const RoutineDetailsPage = ({ params: { id } }: Props) => {
  const { routines, updateRoutine, addTaskToRoutine } = useAppContext();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [newTask, setNewTask] = useState<Partial<RoutineTask>>({
    duration: 5, // Set a default minimum duration
  });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const router = useRouter();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchRoutine = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/routines/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch routine");
        }
        const data = await response.json();
        setRoutine(data);
      } catch (error) {
        console.error("Error fetching routine:", error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoutine((prev) => (prev ? { ...prev, [name]: value } : null));
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editingTask,
            routineId: routine._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setRoutine((prevRoutine) => {
        if (!prevRoutine) return null;
        return {
          ...prevRoutine,
          tasks: prevRoutine.tasks.map((task) =>
            task._id === editingTask._id ? result.updatedTask : task
          ),
        };
      });

      // Update global state
      updateRoutine(routine._id, {
        tasks: routine.tasks.map((task) =>
          task._id === editingTask._id ? result.updatedTask : task
        ),
      });

      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!routine) return;
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/delete-task-from-routine/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ routineId: routine._id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setRoutine((prevRoutine) => {
        if (!prevRoutine) return null;
        return {
          ...prevRoutine,
          tasks: prevRoutine.tasks.filter((task) => task._id !== taskId),
        };
      });

      // Update global state
      updateRoutine(routine._id, {
        tasks: routine.tasks.filter((task) => task._id !== taskId),
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
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
  };

  const handleSave = async () => {
    if (routine) {
      try {
        const response = await fetch(`/api/routines/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(routine),
        });

        if (!response.ok) {
          throw new Error("Failed to update routine");
        }

        const updatedRoutine = await response.json();
        setRoutine(updatedRoutine);
        alert("Routine updated successfully!");
      } catch (error) {
        console.error("Error updating routine:", error);
        alert("Failed to update routine. Please try again.");
      }
    }
  };

  const handleAddTask = async () => {
    if (routine && newTask.name && newTask.duration) {
      try {
        const taskToAdd = {
          ...newTask,
          duration: Math.max(5, Math.min(240, Number(newTask.duration))),
        };

        const response = await fetch(`/api/routines/${id}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskToAdd),
        });

        if (!response.ok) {
          throw new Error("Failed to add task");
        }

        const updatedRoutine = await response.json();
        setRoutine(updatedRoutine);
        setNewTask({ duration: 5 }); // Reset with default duration
        setIsTaskDialogOpen(false);
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!routine) return <div>Routine not found</div>;

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-[59rem]">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.push("/dashboard/routines")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Routines</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {routine.name}
          </h1>
          {routine && (
            <Badge variant="outline" className="ml-auto sm:ml-0">
              {routine.tasks.length} tasks
            </Badge>
          )}
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button size="sm" onClick={handleSave}>
              Save Routine
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid gap-4 sm:col-span-1 lg:col-span-2 lg:gap-8">
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Routine Details</CardTitle>
                <CardDescription>
                  Provide details for your routine.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Routine Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full"
                      value={routine.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Routine Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={routine.description}
                      onChange={handleInputChange}
                      className="min-h-32"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={routine.startTime || ""}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={routine.endTime || ""}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Routine Days</Label>
                    <div className="flex flex-wrap gap-4">
                      {days.map((day) => (
                        <div key={day} className="flex flex-col items-center">
                          <Label htmlFor={day.toLowerCase()} className="mb-1">
                            {day}
                          </Label>
                          <Checkbox
                            id={day.toLowerCase()}
                            checked={routine.days.includes(day)}
                            onCheckedChange={() => handleDayToggle(day)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Tasks associated with this routine.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Description
                        </TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Priority
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routine.tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {task.description}
                          </TableCell>
                          <TableCell>{task.duration} minutes</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {task.priority}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => handleEditTask(task)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleDeleteTask(task._id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t p-4 sm:p-6">
                <Dialog
                  open={isTaskDialogOpen}
                  onOpenChange={setIsTaskDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="task-name"
                          value={newTask.name || ""}
                          onChange={(e) =>
                            setNewTask({ ...newTask, name: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="task-description"
                          className="text-right"
                        >
                          Description
                        </Label>
                        <Input
                          id="task-description"
                          value={newTask.description || ""}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              description: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-duration" className="text-right">
                          Duration (minutes)
                        </Label>
                        <Input
                          id="task-duration"
                          type="number"
                          min="5"
                          max="240"
                          value={newTask.duration || ""}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              duration: Number(e.target.value),
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-priority" className="text-right">
                          Priority
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setNewTask({
                              ...newTask,
                              priority: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:hidden mt-4">
          <Button size="sm" onClick={handleSave} className="w-full sm:w-auto">
            Save Routine
          </Button>
        </div>
      </div>

      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={setIsEditTaskDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details of the task.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-task-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-task-name"
                  value={editingTask.name}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-task-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-task-description"
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-task-duration" className="text-right">
                  Duration (minutes)
                </Label>
                <Input
                  id="edit-task-duration"
                  type="number"
                  min="5"
                  max="240"
                  value={editingTask.duration}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      duration: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-task-priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, priority: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default RoutineDetailsPage;
