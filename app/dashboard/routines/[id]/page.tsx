"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, PlusCircle, CalendarIcon } from "lucide-react";
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
    const findRoutine = () => {
      const foundRoutine = routines.find((r) => r._id === id);
      if (foundRoutine) {
        setRoutine(foundRoutine);
      } else {
        console.error("Routine not found");
        // You might want to handle this case, perhaps by redirecting to a 404 page
      }
      setIsLoading(false);
    };

    findRoutine();
  }, [id, routines]);

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
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {routine.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {routine.tasks.length} tasks
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Routine
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Routine Details</CardTitle>
                <CardDescription>
                  Provide details for your routine.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Tasks associated with this routine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routine.tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.duration}</TableCell>
                        <TableCell>{task.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-center border-t p-4">
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
                            <SelectItem value="High">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">High</SelectItem>
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
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Routine Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Routine
          </Button>
        </div>
      </div>
    </main>
  );
};

export default RoutineDetailsPage;
