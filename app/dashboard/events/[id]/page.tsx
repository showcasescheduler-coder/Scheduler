"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Brain,
  ListTodo,
  Repeat,
  Menu,
  Link as LinkIcon,
  MoreVertical,
  Plus,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarContent } from "@/app/components/SideBar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import MobileNav from "@/app/components/MobileNav";
import { UserButton } from "@clerk/nextjs";
import { format } from "date-fns";
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

interface Task {
  _id: string;
  name: string;
  description: string;
  duration: number;
  priority: string;
  isCustomDuration?: boolean;
}

interface EventData {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  days: string[];
  meetingLink: string | null;
  status: string;
  tasks: Task[];
}

interface EventDetailsProps {
  params: { id: string };
}

export default function EventDetails({ params: { id } }: EventDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ duration: 5 });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch the event (including its tasks)
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Save updated event data
  const handleSave = async () => {
    if (!event) return;
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("Failed to update event");
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      toast.success("Event deleted successfully");
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  // Generic input change for event fields
  const handleInputChange = (field: string, value: any) => {
    if (!event) return;
    setEvent((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Toggle recurring day selection
  const handleDayToggle = (day: string) => {
    if (!event) return;
    setEvent((prev) => {
      if (!prev) return prev;
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  // Add a new task to the event
  const handleAddTask = async () => {
    if (!event || !newTask.name || !newTask.duration) return;
    try {
      const response = await fetch("/api/add-task-to-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, ...newTask }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      const data = await response.json();
      // Assume the API returns { success: true, task, event }
      setEvent(data.event);
      setNewTask({ duration: 5 });
      setIsTaskDialogOpen(false);
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };
  // Update an existing task
  const handleUpdateTask = async () => {
    if (!editingTask || !event) return;
    try {
      const response = await fetch("/api/edit-event-task", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: editingTask._id, ...editingTask }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const data = await response.json();
      // data.updatedTask contains the updated task from the API
      const updatedTask = data.updatedTask;
      setEvent((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((task) =>
          task._id === editingTask._id ? updatedTask : task
        );
        return { ...prev, tasks: updatedTasks };
      });
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  // Delete a task from the event
  const handleDeleteTask = async (taskId: string) => {
    if (!event || !confirm("Are you sure you want to delete this task?"))
      return;
    try {
      const response = await fetch("/api/delete-task-from-event", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, taskId }),
      });
      if (!response.ok) throw new Error("Failed to delete task");
      const data = await response.json();
      // Assume the API returns the updated event as { success: true, event }
      setEvent(data.event);
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

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
                onClick={() => router.push("/dashboard/events")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold truncate">
                    {event.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                      {event.status || "Upcoming"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.isRecurring ? "Recurring Event" : event.date}
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
                  onClick={() => router.push("/dashboard/events")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      {event.name}
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {event.status || "Upcoming"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.meetingLink && (
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2 text-blue-500" />
                    Join Meeting
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Event Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>
                          {event.isRecurring
                            ? event.days.join(", ")
                            : event.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Select
                      value={event.status || "upcoming"}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-blue-500">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Details Form */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Title and Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <ListTodo className="h-4 w-4 text-blue-500" />
                        Event Title
                      </label>
                      <Input
                        value={event.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="mt-2 border-gray-200 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Brain className="h-4 w-4 text-blue-500" />
                        Description
                      </label>
                      <Textarea
                        value={event.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="mt-2 min-h-[320px] border-gray-200 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Other Details */}
                  <div className="space-y-6">
                    {!event.isRecurring ? (
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Date
                          </label>
                          <Input
                            type="date"
                            value={event.date}
                            onChange={(e) =>
                              handleInputChange("date", e.target.value)
                            }
                            className="mt-2 border-gray-200 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Time
                          </label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="time"
                              value={event.startTime}
                              onChange={(e) =>
                                handleInputChange("startTime", e.target.value)
                              }
                              className="flex-1 border-gray-200 focus:ring-blue-500"
                            />
                            <Input
                              type="time"
                              value={event.endTime}
                              onChange={(e) =>
                                handleInputChange("endTime", e.target.value)
                              }
                              className="flex-1 border-gray-200 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          Recurring Days
                        </label>
                        <div className="grid grid-cols-2 gap-4">
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
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={day}
                                checked={event.days.includes(day)}
                                onCheckedChange={() => handleDayToggle(day)}
                                className="border-blue-500 text-blue-500 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={day}
                                className="text-sm text-gray-700"
                              >
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <LinkIcon className="h-4 w-4 text-blue-500" />
                        Meeting Link
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={event.meetingLink || ""}
                          onChange={(e) =>
                            handleInputChange("meetingLink", e.target.value)
                          }
                          placeholder="Add meeting link (optional)"
                          className="border-gray-200 focus:ring-blue-500"
                        />
                        <Button variant="outline" size="icon">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}
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
                            Type
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Duration
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Priority
                          </TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.tasks && event.tasks.length > 0 ? (
                          event.tasks.map((task) => (
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
                                {/* Optionally display task type */}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {task.duration} min
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
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
                          ))
                        ) : (
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

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-600">
                      Delete Event
                    </h3>
                    <p className="text-sm text-gray-500">
                      Permanently delete this event
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    Delete Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to this event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-task-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="event-task-name"
                  value={newTask.name || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="event-task-description"
                  className="text-right pt-2"
                >
                  Description
                </Label>
                <Textarea
                  id="event-task-description"
                  value={newTask.description || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="col-span-3 min-h-[100px]"
                  placeholder="Enter task description..."
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="event-task-duration"
                  className="text-right pt-2"
                >
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
                    <SelectTrigger id="event-task-duration" className="w-full">
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

        {/* Edit Task Dialog */}
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
                  <Label htmlFor="edit-event-task-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-event-task-name"
                    value={editingTask.name}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="edit-event-task-description"
                    className="text-right pt-2"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="edit-event-task-description"
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
                  <Label
                    htmlFor="edit-event-task-duration"
                    className="text-right pt-2"
                  >
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
                      <SelectTrigger
                        id="edit-event-task-duration"
                        className="w-full"
                      >
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

// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   Users,
//   Video,
//   Brain,
//   LayoutDashboard,
//   FolderKanban,
//   ListTodo,
//   Repeat,
//   BarChart2,
//   Menu,
//   MapPin,
//   Link as LinkIcon,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { SidebarContent } from "@/app/components/SideBar";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";
// import { Checkbox } from "@/components/ui/checkbox";
// import MobileNav from "@/app/components/MobileNav";
// import { UserButton } from "@clerk/nextjs";
// import { format } from "date-fns";

// interface EventDetailsProps {
//   params: { id: string };
// }

// export default function EventDetails({ params: { id } }: EventDetailsProps) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [event, setEvent] = useState<{
//     name: string;
//     description: string;
//     date: string;
//     startTime: string;
//     endTime: string;
//     isRecurring: boolean;
//     days: string[];
//     meetingLink: string | null;
//     status: string;
//   } | null>(null);

//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const response = await fetch(`/api/events/${id}`);
//         if (!response.ok) throw new Error("Failed to fetch event");
//         const data = await response.json();
//         setEvent(data);
//       } catch (error) {
//         console.error("Error fetching event:", error);
//         toast.error("Failed to load event");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEvent();
//   }, [id]);

//   const handleSave = async () => {
//     if (!event) return;

//     try {
//       const response = await fetch(`/api/events/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(event),
//       });

//       if (!response.ok) throw new Error("Failed to update event");

//       toast.success("Event updated successfully");
//     } catch (error) {
//       console.error("Error updating event:", error);
//       toast.error("Failed to update event");
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm("Are you sure you want to delete this event?")) return;

//     try {
//       const response = await fetch(`/api/events/${id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) throw new Error("Failed to delete event");

//       toast.success("Event deleted successfully");
//       router.push("/dashboard/events");
//     } catch (error) {
//       console.error("Error deleting event:", error);
//       toast.error("Failed to delete event");
//     }
//   };

//   const handleInputChange = (field: string, value: any) => {
//     if (!event) return;
//     setEvent((prev) => {
//       if (!prev) return prev;
//       return { ...prev, [field]: value };
//     });
//   };

//   const handleDayToggle = (day: string) => {
//     if (!event) return;
//     setEvent((prev) => {
//       if (!prev) return prev;
//       const newDays = prev.days.includes(day)
//         ? prev.days.filter((d) => d !== day)
//         : [...prev.days, day];
//       return { ...prev, days: newDays };
//     });
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (!event) return <div>Event not found</div>;

//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <div className="flex-1 flex flex-col h-full overflow-hidden">
//         {/* Mobile Header */}
//         <div className="md:hidden border-b border-gray-200">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                     <Menu className="h-5 w-5" />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="left" className="w-64 p-0">
//                   <MobileNav />
//                 </SheetContent>
//               </Sheet>
//               <div className="text-sm font-medium">
//                 {format(new Date(), "MMM d, yyyy")}
//               </div>
//               <UserButton />
//             </div>
//           </div>

//           <div className="px-4 py-3">
//             <div className="flex items-center gap-3">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 -ml-2 shrink-0"
//                 onClick={() => router.push("/dashboard/events")}
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//               <div className="flex-1 flex items-center justify-between">
//                 <div className="min-w-0 flex-1">
//                   <h1 className="text-lg font-semibold truncate">
//                     {event.name}
//                   </h1>
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
//                       {event.status || "Upcoming"}
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {event.isRecurring ? "Recurring Event" : event.date}
//                     </span>
//                   </div>
//                 </div>
//                 <Button
//                   size="sm"
//                   onClick={handleSave}
//                   className="ml-4 shrink-0"
//                 >
//                   Save
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Desktop Header */}
//         <header className="hidden md:block border-b border-gray-200 bg-white sticky top-0 z-10">
//           <div className="px-4 md:px-8 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => router.push("/dashboard/events")}
//                 >
//                   <ArrowLeft className="h-5 w-5" />
//                 </Button>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h1 className="text-xl md:text-2xl font-semibold">
//                       {event.name}
//                     </h1>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
//                       {event.status || "Upcoming"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 {event.meetingLink && (
//                   <Button variant="outline" size="sm">
//                     <Video className="h-4 w-4 mr-2 text-blue-500" />
//                     Join Meeting
//                   </Button>
//                 )}
//                 <Button
//                   size="sm"
//                   className="bg-blue-600 hover:bg-blue-700"
//                   onClick={handleSave}
//                 >
//                   Save Changes
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8 space-y-6">
//             {/* Event Info Cards */}
//             <div className="grid md:grid-cols-3 gap-4">
//               <Card className="md:col-span-2">
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4 text-sm text-gray-500">
//                       <div className="flex items-center gap-1">
//                         <Clock className="h-4 w-4 text-blue-500" />
//                         <span>
//                           {event.startTime} - {event.endTime}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Calendar className="h-4 w-4 text-blue-500" />
//                         <span>
//                           {event.isRecurring
//                             ? event.days.join(", ")
//                             : event.date}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="space-y-2">
//                     <Select
//                       value={event.status || "upcoming"}
//                       onValueChange={(value) =>
//                         handleInputChange("status", value)
//                       }
//                     >
//                       <SelectTrigger className="border-gray-200 focus:ring-blue-500">
//                         <SelectValue placeholder="Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="upcoming">Upcoming</SelectItem>
//                         <SelectItem value="completed">Completed</SelectItem>
//                         <SelectItem value="cancelled">Cancelled</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Event Details Form */}
//             <Card>
//               <CardContent className="p-4 md:p-6">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   {/* Left Column - Title and Description */}
//                   <div className="space-y-4">
//                     <div>
//                       <label className="flex items-center gap-2 text-sm font-medium">
//                         <ListTodo className="h-4 w-4 text-blue-500" />
//                         Event Title
//                       </label>
//                       <Input
//                         value={event.name}
//                         onChange={(e) =>
//                           handleInputChange("name", e.target.value)
//                         }
//                         className="mt-2 border-gray-200 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="flex items-center gap-2 text-sm font-medium">
//                         <Brain className="h-4 w-4 text-blue-500" />
//                         Description
//                       </label>
//                       <Textarea
//                         value={event.description}
//                         onChange={(e) =>
//                           handleInputChange("description", e.target.value)
//                         }
//                         className="mt-2 min-h-[320px] border-gray-200 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>

//                   {/* Right Column - Other Details */}
//                   <div className="space-y-6">
//                     {!event.isRecurring ? (
//                       <div className="space-y-4">
//                         <div>
//                           <label className="flex items-center gap-2 text-sm font-medium">
//                             <Calendar className="h-4 w-4 text-blue-500" />
//                             Date
//                           </label>
//                           <Input
//                             type="date"
//                             value={event.date}
//                             onChange={(e) =>
//                               handleInputChange("date", e.target.value)
//                             }
//                             className="mt-2 border-gray-200 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="flex items-center gap-2 text-sm font-medium">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             Time
//                           </label>
//                           <div className="flex items-center gap-2 mt-2">
//                             <Input
//                               type="time"
//                               value={event.startTime}
//                               onChange={(e) =>
//                                 handleInputChange("startTime", e.target.value)
//                               }
//                               className="flex-1 border-gray-200 focus:ring-blue-500"
//                             />
//                             <Input
//                               type="time"
//                               value={event.endTime}
//                               onChange={(e) =>
//                                 handleInputChange("endTime", e.target.value)
//                               }
//                               className="flex-1 border-gray-200 focus:ring-blue-500"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         <label className="flex items-center gap-2 text-sm font-medium">
//                           <Repeat className="h-4 w-4 text-blue-500" />
//                           Recurring Days
//                         </label>
//                         <div className="grid grid-cols-2 gap-4">
//                           {[
//                             "Monday",
//                             "Tuesday",
//                             "Wednesday",
//                             "Thursday",
//                             "Friday",
//                             "Saturday",
//                             "Sunday",
//                           ].map((day) => (
//                             <div
//                               key={day}
//                               className="flex items-center space-x-2"
//                             >
//                               <Checkbox
//                                 id={day}
//                                 checked={event.days.includes(day)}
//                                 onCheckedChange={() => handleDayToggle(day)}
//                                 className="border-blue-500 text-blue-500 focus:ring-blue-500"
//                               />
//                               <label
//                                 htmlFor={day}
//                                 className="text-sm text-gray-700"
//                               >
//                                 {day}
//                               </label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div className="pt-4 border-t border-gray-100">
//                       <label className="flex items-center gap-2 text-sm font-medium">
//                         <LinkIcon className="h-4 w-4 text-blue-500" />
//                         Meeting Link
//                       </label>
//                       <div className="flex items-center gap-2 mt-2">
//                         <Input
//                           value={event.meetingLink || ""}
//                           onChange={(e) =>
//                             handleInputChange("meetingLink", e.target.value)
//                           }
//                           placeholder="Add meeting link (optional)"
//                           className="border-gray-200 focus:ring-blue-500"
//                         />
//                         <Button variant="outline" size="icon">
//                           <LinkIcon className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Tasks Section */}
//             <Card>
//               <CardContent className="p-4 md:p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold">Tasks</h2>
//                   <Dialog
//                     open={isTaskDialogOpen}
//                     onOpenChange={setIsTaskDialogOpen}
//                   >
//                     <DialogTrigger asChild>
//                       <Button
//                         size="sm"
//                         className="bg-blue-600 hover:bg-blue-700"
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Task
//                       </Button>
//                     </DialogTrigger>
//                   </Dialog>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <div className="rounded-lg border min-w-[300px] md:min-w-[600px]">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Task</TableHead>
//                           <TableHead className="hidden md:table-cell">
//                             Type
//                           </TableHead>
//                           <TableHead className="hidden md:table-cell">
//                             Duration
//                           </TableHead>
//                           <TableHead className="hidden md:table-cell">
//                             Priority
//                           </TableHead>
//                           <TableHead className="w-24">Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {event.tasks && event.tasks.length > 0 ? (
//                           event.tasks.map((task) => (
//                             <TableRow key={task._id}>
//                               <TableCell className="font-medium">
//                                 <div>
//                                   <div>{task.name}</div>
//                                   <div className="md:hidden text-sm text-gray-500">
//                                     {task.duration} min
//                                   </div>
//                                 </div>
//                               </TableCell>
//                               <TableCell className="hidden md:table-cell">
//                                 {/* Optionally display task type */}
//                               </TableCell>
//                               <TableCell className="hidden md:table-cell">
//                                 {task.duration} min
//                               </TableCell>
//                               <TableCell className="hidden md:table-cell">
//                                 <span
//                                   className={`inline-block px-2 py-1 rounded-full text-xs ${
//                                     task.priority === "High"
//                                       ? "bg-red-100 text-red-800"
//                                       : task.priority === "Medium"
//                                       ? "bg-yellow-100 text-yellow-800"
//                                       : "bg-blue-100 text-blue-800"
//                                   }`}
//                                 >
//                                   {task.priority}
//                                 </span>
//                               </TableCell>
//                               <TableCell>
//                                 <DropdownMenu modal={false}>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" size="icon">
//                                       <MoreVertical className="h-4 w-4" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuItem
//                                       onSelect={(e) => {
//                                         e.preventDefault();
//                                         setEditingTask(task);
//                                         setIsEditTaskDialogOpen(true);
//                                       }}
//                                     >
//                                       <span>Edit Task</span>
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onSelect={() =>
//                                         handleDeleteTask(task._id)
//                                       }
//                                       className="text-red-600"
//                                     >
//                                       Delete
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </TableCell>
//                             </TableRow>
//                           ))
//                         ) : (
//                           <TableRow>
//                             <TableCell
//                               colSpan={5}
//                               className="text-center py-6 text-sm text-gray-500"
//                             >
//                               <ListTodo className="h-8 w-8 mx-auto mb-2 text-gray-400" />
//                               No tasks added yet
//                             </TableCell>
//                           </TableRow>
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Danger Zone */}
//             <Card className="border-red-200">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm font-medium text-red-600">
//                       Delete Event
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Permanently delete this event
//                     </p>
//                   </div>
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     onClick={handleDelete}
//                   >
//                     Delete Event
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Add Task Dialog */}
//         <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Task</DialogTitle>
//               <DialogDescription>
//                 Add a new task to this event.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-6 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="event-task-name" className="text-right">
//                   Name
//                 </Label>
//                 <Input
//                   id="event-task-name"
//                   value={newTask.name || ""}
//                   onChange={(e) =>
//                     setNewTask({ ...newTask, name: e.target.value })
//                   }
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-start gap-4">
//                 <Label
//                   htmlFor="event-task-description"
//                   className="text-right pt-2"
//                 >
//                   Description
//                 </Label>
//                 <Textarea
//                   id="event-task-description"
//                   value={newTask.description || ""}
//                   onChange={(e) =>
//                     setNewTask({ ...newTask, description: e.target.value })
//                   }
//                   className="col-span-3 min-h-[100px]"
//                   placeholder="Enter task description..."
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-start gap-4">
//                 <Label
//                   htmlFor="event-task-duration"
//                   className="text-right pt-2"
//                 >
//                   Duration
//                 </Label>
//                 <div className="col-span-3 space-y-2">
//                   <Select
//                     value={
//                       newTask.isCustomDuration
//                         ? "custom"
//                         : newTask.duration?.toString() || "0"
//                     }
//                     onValueChange={(value) => {
//                       if (value === "custom") {
//                         setNewTask({
//                           ...newTask,
//                           duration: 0,
//                           isCustomDuration: true,
//                         });
//                       } else {
//                         setNewTask({
//                           ...newTask,
//                           duration: parseInt(value),
//                           isCustomDuration: false,
//                         });
//                       }
//                     }}
//                   >
//                     <SelectTrigger id="event-task-duration" className="w-full">
//                       <SelectValue placeholder="Select duration" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="0">Can be done in parallel</SelectItem>
//                       <SelectItem value="5">5 minutes</SelectItem>
//                       <SelectItem value="10">10 minutes</SelectItem>
//                       <SelectItem value="15">15 minutes</SelectItem>
//                       <SelectItem value="30">30 minutes</SelectItem>
//                       <SelectItem value="45">45 minutes</SelectItem>
//                       <SelectItem value="60">1 hour</SelectItem>
//                       <SelectItem value="120">2 hours</SelectItem>
//                       <SelectItem value="custom">Custom duration...</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {newTask.isCustomDuration && (
//                     <div className="flex items-center gap-2">
//                       <Input
//                         type="number"
//                         min="1"
//                         max="480"
//                         value={newTask.duration || ""}
//                         onChange={(e) => {
//                           const value = parseInt(e.target.value);
//                           if (!isNaN(value) && value >= 0 && value <= 480) {
//                             setNewTask({ ...newTask, duration: value });
//                           }
//                         }}
//                         className="flex-1"
//                         placeholder="Enter duration in minutes"
//                       />
//                       <span className="text-sm text-gray-500 w-16">
//                         minutes
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//                 onClick={handleAddTask}
//               >
//                 Add Task
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Edit Task Dialog */}
//         <Dialog
//           open={isEditTaskDialogOpen}
//           onOpenChange={(open) => {
//             setIsEditTaskDialogOpen(open);
//             if (!open) setEditingTask(null);
//           }}
//         >
//           {editingTask && (
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Task</DialogTitle>
//                 <DialogDescription>Modify the task details</DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-6 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="edit-event-task-name" className="text-right">
//                     Name
//                   </Label>
//                   <Input
//                     id="edit-event-task-name"
//                     value={editingTask.name}
//                     onChange={(e) =>
//                       setEditingTask({ ...editingTask, name: e.target.value })
//                     }
//                     className="col-span-3"
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-start gap-4">
//                   <Label
//                     htmlFor="edit-event-task-description"
//                     className="text-right pt-2"
//                   >
//                     Description
//                   </Label>
//                   <Textarea
//                     id="edit-event-task-description"
//                     value={editingTask.description}
//                     onChange={(e) =>
//                       setEditingTask({
//                         ...editingTask,
//                         description: e.target.value,
//                       })
//                     }
//                     className="col-span-3 min-h-[100px]"
//                     placeholder="Enter task description..."
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-start gap-4">
//                   <Label
//                     htmlFor="edit-event-task-duration"
//                     className="text-right pt-2"
//                   >
//                     Duration
//                   </Label>
//                   <div className="col-span-3 space-y-2">
//                     <Select
//                       value={
//                         editingTask.isCustomDuration
//                           ? "custom"
//                           : editingTask.duration?.toString() || "0"
//                       }
//                       onValueChange={(value) => {
//                         if (value === "custom") {
//                           setEditingTask({
//                             ...editingTask,
//                             duration: 0,
//                             isCustomDuration: true,
//                           });
//                         } else {
//                           setEditingTask({
//                             ...editingTask,
//                             duration: parseInt(value),
//                             isCustomDuration: false,
//                           });
//                         }
//                       }}
//                     >
//                       <SelectTrigger
//                         id="edit-event-task-duration"
//                         className="w-full"
//                       >
//                         <SelectValue placeholder="Select duration" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="0">
//                           Can be done in parallel
//                         </SelectItem>
//                         <SelectItem value="5">5 minutes</SelectItem>
//                         <SelectItem value="10">10 minutes</SelectItem>
//                         <SelectItem value="15">15 minutes</SelectItem>
//                         <SelectItem value="30">30 minutes</SelectItem>
//                         <SelectItem value="45">45 minutes</SelectItem>
//                         <SelectItem value="60">1 hour</SelectItem>
//                         <SelectItem value="120">2 hours</SelectItem>
//                         <SelectItem value="custom">
//                           Custom duration...
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {editingTask.isCustomDuration && (
//                       <div className="flex items-center gap-2">
//                         <Input
//                           type="number"
//                           min="1"
//                           max="480"
//                           value={editingTask.duration || ""}
//                           onChange={(e) => {
//                             const value = parseInt(e.target.value);
//                             if (!isNaN(value) && value >= 0 && value <= 480) {
//                               setEditingTask({
//                                 ...editingTask,
//                                 duration: value,
//                               });
//                             }
//                           }}
//                           className="flex-1"
//                           placeholder="Enter duration in minutes"
//                         />
//                         <span className="text-sm text-gray-500 w-16">
//                           minutes
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   onClick={handleUpdateTask}
//                   className="bg-blue-600 hover:bg-blue-700 text-white"
//                 >
//                   Update Task
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           )}
//         </Dialog>
//       </div>
//     </div>
//   );

// }

// return (
//   <div className="flex h-screen bg-white">
//     <aside className="hidden md:block w-16 border-r border-gray-200">
//       <SidebarContent />
//     </aside>

//     <div className="flex-1 flex flex-col h-full overflow-hidden">
//       {/* Mobile Header */}
//       <div className="md:hidden border-b border-gray-200">
//         <div className="px-4 py-3 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 p-0">
//                 <MobileNav />
//               </SheetContent>
//             </Sheet>

//             <div className="text-sm font-medium">
//               {format(new Date(), "MMM d, yyyy")}
//             </div>

//             <UserButton />
//           </div>
//         </div>

//         <div className="px-4 py-3">
//           <div className="flex items-center gap-3">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-8 w-8 -ml-2 shrink-0"
//               onClick={() => router.push("/dashboard/events")}
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//             <div className="flex-1 flex items-center justify-between">
//               <div className="min-w-0 flex-1">
//                 <h1 className="text-lg font-semibold truncate">
//                   {event.name}
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
//                     {event.status || "Upcoming"}
//                   </span>
//                   <span className="text-xs text-gray-500">
//                     {event.isRecurring ? "Recurring Event" : event.date}
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 size="sm"
//                 onClick={handleSave}
//                 className="ml-4 shrink-0"
//               >
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Desktop Header */}
//       <header className="hidden md:block border-b border-gray-200 bg-white sticky top-0 z-10">
//         <div className="px-4 md:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => router.push("/dashboard/events")}
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-xl md:text-2xl font-semibold">
//                     {event.name}
//                   </h1>
//                   <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
//                     {event.status || "Upcoming"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {event.meetingLink && (
//                 <Button variant="outline" size="sm">
//                   <Video className="h-4 w-4 mr-2 text-blue-500" />
//                   Join Meeting
//                 </Button>
//               )}
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSave}
//               >
//                 Save Changes
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="flex-1 overflow-y-auto">
//         <div className="p-4 md:p-8 space-y-6">
//           {/* Event Info Cards */}
//           <div className="grid md:grid-cols-3 gap-4">
//             <Card className="md:col-span-2">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4 text-sm text-gray-500">
//                     <div className="flex items-center gap-1">
//                       <Clock className="h-4 w-4 text-blue-500" />
//                       <span>
//                         {event.startTime} - {event.endTime}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Calendar className="h-4 w-4 text-blue-500" />
//                       <span>
//                         {event.isRecurring
//                           ? event.days.join(", ")
//                           : event.date}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="space-y-2">
//                   <Select
//                     value={event.status || "upcoming"}
//                     onValueChange={(value) =>
//                       handleInputChange("status", value)
//                     }
//                   >
//                     <SelectTrigger className="border-gray-200 focus:ring-blue-500">
//                       <SelectValue placeholder="Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="upcoming">Upcoming</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Event Details Form */}
//           <Card>
//             <CardContent className="p-4 md:p-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Left Column - Title and Description */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-medium">
//                       <ListTodo className="h-4 w-4 text-blue-500" />
//                       Event Title
//                     </label>
//                     <Input
//                       value={event.name}
//                       onChange={(e) =>
//                         handleInputChange("name", e.target.value)
//                       }
//                       className="mt-2 border-gray-200 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-medium">
//                       <Brain className="h-4 w-4 text-blue-500" />
//                       Description
//                     </label>
//                     <Textarea
//                       value={event.description}
//                       onChange={(e) =>
//                         handleInputChange("description", e.target.value)
//                       }
//                       className="mt-2 min-h-[320px] border-gray-200 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>

//                 {/* Right Column - Other Details */}
//                 <div className="space-y-6">
//                   {!event.isRecurring ? (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium">
//                           <Calendar className="h-4 w-4 text-blue-500" />
//                           Date
//                         </label>
//                         <Input
//                           type="date"
//                           value={event.date}
//                           onChange={(e) =>
//                             handleInputChange("date", e.target.value)
//                           }
//                           className="mt-2 border-gray-200 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium">
//                           <Clock className="h-4 w-4 text-blue-500" />
//                           Time
//                         </label>
//                         <div className="flex items-center gap-2 mt-2">
//                           <Input
//                             type="time"
//                             value={event.startTime}
//                             onChange={(e) =>
//                               handleInputChange("startTime", e.target.value)
//                             }
//                             className="flex-1 border-gray-200 focus:ring-blue-500"
//                           />
//                           <Input
//                             type="time"
//                             value={event.endTime}
//                             onChange={(e) =>
//                               handleInputChange("endTime", e.target.value)
//                             }
//                             className="flex-1 border-gray-200 focus:ring-blue-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <label className="flex items-center gap-2 text-sm font-medium">
//                         <Repeat className="h-4 w-4 text-blue-500" />
//                         Recurring Days
//                       </label>
//                       <div className="grid grid-cols-2 gap-4">
//                         {[
//                           "Monday",
//                           "Tuesday",
//                           "Wednesday",
//                           "Thursday",
//                           "Friday",
//                           "Saturday",
//                           "Sunday",
//                         ].map((day) => (
//                           <div
//                             key={day}
//                             className="flex items-center space-x-2"
//                           >
//                             <Checkbox
//                               id={day}
//                               checked={event.days.includes(day)}
//                               onCheckedChange={() => handleDayToggle(day)}
//                               className="border-blue-500 text-blue-500 focus:ring-blue-500"
//                             />
//                             <label
//                               htmlFor={day}
//                               className="text-sm text-gray-700"
//                             >
//                               {day}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <div className="pt-4 border-t border-gray-100">
//                     <label className="flex items-center gap-2 text-sm font-medium">
//                       <LinkIcon className="h-4 w-4 text-blue-500" />
//                       Meeting Link
//                     </label>
//                     <div className="flex items-center gap-2 mt-2">
//                       <Input
//                         value={event.meetingLink || ""}
//                         onChange={(e) =>
//                           handleInputChange("meetingLink", e.target.value)
//                         }
//                         placeholder="Add meeting link (optional)"
//                         className="border-gray-200 focus:ring-blue-500"
//                       />
//                       <Button variant="outline" size="icon">
//                         <LinkIcon className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Danger Zone */}
//           <Card className="border-red-200">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-sm font-medium text-red-600">
//                     Delete Event
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     Permanently delete this event
//                   </p>
//                 </div>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={handleDelete}
//                 >
//                   Delete Event
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   </div>
// );
