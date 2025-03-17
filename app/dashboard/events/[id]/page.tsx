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
  Check,
  Square,
  AlertCircle,
  Info,
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
  completed: boolean;
  _id: string;
  name: string;
  description: string;
  duration: number;
  priority: string;
  isCustomDuration?: boolean;
  status: string;
  type: string;
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
  completed: boolean;
  tasks: Task[];
  eventType?: "meeting" | "personal" | "health" | "exercise";
  instanceHistory?: Array<{
    date: string;
    blockId: string;
    status: "pending" | "complete" | "incomplete" | "missed";
    completedAt?: string;
  }>;
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
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledInfo, setScheduledInfo] = useState({
    date: null,
    blockId: null,
    startTime: null,
    endTime: null,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    date: "",
    time: "",
    days: "",
    meetingLink: "",
  });

  const checkIfEventIsScheduled = async (eventId: string) => {
    try {
      const response = await fetch(`/api/check-event-scheduled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) throw new Error("Failed to check event schedule");
      const data = await response.json();

      setIsScheduled(data.isScheduled);
      setScheduledInfo({
        date: data.scheduledDate,
        blockId: data.blockId,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      // If scheduled, ensure UI reflects correct times
      if (data.isScheduled && event) {
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                startTime: data.startTime,
                endTime: data.endTime,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error checking event schedule:", error);
    }
  };

  // Fetch the event (including its tasks)
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const data = await response.json();
        setEvent(data);

        // Only check scheduling for non-recurring events
        if (!data.isRecurring) {
          checkIfEventIsScheduled(id);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const isEventInPast = (eventDate: string | number | Date) => {
    if (!eventDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for proper comparison

    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0); // Reset to start of day

    return eventDateObj < today;
  };

  // Save updated event data
  // Save updated event data
  const handleSave = async () => {
    if (!event) return;

    // Reset errors before validation
    setFormErrors({
      name: "",
      date: "",
      time: "",
      days: "",
      meetingLink: "",
    });

    // Perform validation
    let isValid = true;
    const newErrors = {
      name: "",
      date: "",
      time: "",
      days: "",
      meetingLink: "",
    };

    // Name is required
    if (!event.name.trim()) {
      newErrors.name = "Event name is required";
      isValid = false;
    }

    // For non-recurring events
    if (!event.isRecurring) {
      // Date is required
      if (!event.date) {
        newErrors.date = "Date is required";
        isValid = false;
      } else if (!isDateTimeDisabled) {
        // Only validate date if it's not disabled by your existing logic
        const selectedDate = new Date(event.date);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors.date = "Date cannot be in the past";
          isValid = false;
        }
      }
    } else {
      // For recurring events, at least one day must be selected
      if (event.days.length === 0) {
        newErrors.days = "Please select at least one day";
        isValid = false;
      }
    }

    // Time validation - only if not disabled by your existing logic
    if (!isDateTimeDisabled) {
      if (!event.startTime) {
        newErrors.time = "Start time is required";
        isValid = false;
      } else if (!event.endTime) {
        newErrors.time = "End time is required";
        isValid = false;
      } else if (event.startTime >= event.endTime) {
        newErrors.time = "End time must be after start time";
        isValid = false;
      }

      // Check if event datetime is in the past for non-recurring events
      if (!event.isRecurring && event.date && event.startTime) {
        const eventDateTime = new Date(event.date);
        const [hours, minutes] = event.startTime.split(":").map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);

        if (eventDateTime < new Date()) {
          newErrors.time = "Event time cannot be in the past";
          isValid = false;
        }
      }
    }

    // Validate meeting link format if provided
    if (event.meetingLink && !event.meetingLink.trim().startsWith("http")) {
      newErrors.meetingLink =
        "Please enter a valid URL starting with http:// or https://";
      isValid = false;
    }

    // If validation fails, update errors and return
    if (!isValid) {
      setFormErrors(newErrors);
      return;
    }

    // Continue with your existing save logic
    try {
      // Your existing logic for scheduled non-recurring events
      if (!event.isRecurring && isScheduled) {
        // Restore original time values from scheduledInfo before saving
        const updatedEvent = {
          ...event,
          startTime: scheduledInfo.startTime || event.startTime,
          endTime: scheduledInfo.endTime || event.endTime,
        };

        const response = await fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEvent),
        });

        if (!response.ok) throw new Error("Failed to update event");
        setEvent(updatedEvent);
        toast.success("Event updated successfully");
      } else {
        // Normal save for non-scheduled or recurring events
        const response = await fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        if (!response.ok) throw new Error("Failed to update event");
        toast.success("Event updated successfully");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  // Now it's safe to access event properties
  const isDateTimeDisabled =
    (!event.isRecurring && isScheduled) ||
    (!event.isRecurring && isEventInPast(event.date));

  const getDateTimeDisabledReason = () => {
    if (!event.isRecurring && isScheduled) {
      return "Locked - event is scheduled";
    } else if (!event.isRecurring && isEventInPast(event.date)) {
      return "Locked - event date has passed";
    }
    return "";
  };

  // Delete event
  const handleDelete = async () => {
    // Check if it's a non-recurring event that's scheduled for today/tomorrow
    if (!event.isRecurring && isScheduled) {
      toast.error("Cannot delete events scheduled for today or tomorrow");
      return;
    }

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

    // Clear errors when field changes
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // If changing time fields, clear time errors
    if ((field === "startTime" || field === "endTime") && formErrors.time) {
      setFormErrors((prev) => ({
        ...prev,
        time: "",
      }));
    }
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

    // Clear days error when toggling days
    if (formErrors.days) {
      setFormErrors((prev) => ({
        ...prev,
        days: "",
      }));
    }
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

  console.log(event);

  const handleCompleteEvent = async () => {
    if (!event) return;

    // Determine if we're completing or reactivating
    const isCompleting = !event.completed;

    // Prepare action text based on current state
    const actionText = isCompleting ? "complete" : "reactivate";

    // Confirm action before proceeding
    if (!confirm(`Are you sure you want to ${actionText} this event?`)) return;

    try {
      const response = await fetch(`/api/complete-event`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          completed: isCompleting,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${actionText} event`);

      const data = await response.json();

      // Update local state with the returned event
      setEvent(data.event);

      // Show success message
      toast.success(`Event ${actionText}d successfully`);
    } catch (error) {
      console.error(`Error ${actionText}ing event:`, error);
      toast.error(`Failed to ${actionText} event`);
    }
  };

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
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                      Join Meeting
                    </a>
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
                            ? `Repeats on: ${event.days.join(", ")}`
                            : event.date
                            ? new Date(event.date).toLocaleDateString()
                            : "No date set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor:
                              event.eventType === "meeting"
                                ? "#e0f2fe" // sky-100
                                : event.eventType === "personal"
                                ? "#f5d0fe" // fuchsia-100
                                : event.eventType === "health"
                                ? "#ccfbf1" // teal-100
                                : event.eventType === "exercise"
                                ? "#d1fae5" // emerald-100
                                : "#f3f4f6", // gray-100 (default)
                            color:
                              event.eventType === "meeting"
                                ? "#0284c7" // sky-600
                                : event.eventType === "personal"
                                ? "#c026d3" // fuchsia-600
                                : event.eventType === "health"
                                ? "#0d9488" // teal-600
                                : event.eventType === "exercise"
                                ? "#059669" // emerald-600
                                : "#4b5563", // gray-600 (default)
                          }}
                        >
                          {event.eventType
                            ? event.eventType.charAt(0).toUpperCase() +
                              event.eventType.slice(1)
                            : "Meeting"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!event.isRecurring && event.completed === true && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Completed
                      </span>
                    </div>
                  )}
                  {event.isRecurring &&
                    event.instanceHistory &&
                    event.instanceHistory.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            Recent Instances
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {event.instanceHistory
                            .slice(0, 5)
                            .map((instance, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-50"
                              >
                                <span className="text-gray-700">
                                  {new Date(instance.date).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" }
                                  )}
                                  :
                                </span>
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    instance.status === "complete"
                                      ? "bg-green-500"
                                      : instance.status === "incomplete"
                                      ? "bg-yellow-500"
                                      : instance.status === "missed"
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                                  }`}
                                ></span>
                                <span className="text-gray-600">
                                  {instance.status}
                                </span>
                              </div>
                            ))}
                          {event.instanceHistory.length > 5 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{event.instanceHistory.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Complete/Reactivate button */}
                    {event.isRecurring ? (
                      <Button
                        className={`w-full ${
                          event.completed
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        onClick={handleCompleteEvent}
                      >
                        {event.completed ? (
                          <>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Reactivate Event
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Archive Event
                          </>
                        )}
                      </Button>
                    ) : (
                      // For non-recurring events, show a disabled informational button
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gray-100 text-gray-500 hover:bg-gray-100 cursor-default"
                          disabled
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Event Status
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          One-time events are completed via the schedule
                        </p>
                      </div>
                    )}

                    {/* Show a badge if the event is completed */}
                    {event.completed && !event.isRecurring && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      </div>
                    )}
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
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={event.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`mt-2 border-gray-200 focus:ring-blue-500 ${
                          formErrors.name ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.name}
                        </p>
                      )}
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
                  {/* Right Column - Other Details */}
                  {/* Right Column - Other Details */}
                  <div className="space-y-6">
                    {/* Toggle for Recurring Event */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {event.isRecurring
                            ? "Recurring Event"
                            : "One-time Event"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.isRecurring
                          ? `Repeats on: ${event.days.join(", ")}`
                          : event.date
                          ? new Date(event.date).toLocaleDateString()
                          : "No date set"}
                      </span>
                    </div>

                    {/* Time Selection (available for both recurring and non-recurring events) */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Time <span className="text-red-500">*</span>
                        {isDateTimeDisabled && (
                          <span className="text-xs text-amber-600 ml-2">
                            ({getDateTimeDisabledReason()})
                          </span>
                        )}
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="time"
                          value={event.startTime}
                          onChange={(e) =>
                            handleInputChange("startTime", e.target.value)
                          }
                          disabled={isDateTimeDisabled}
                          className={`flex-1 border-gray-200 focus:ring-blue-500 ${
                            isDateTimeDisabled
                              ? "bg-gray-100 cursor-not-allowed"
                              : formErrors.time
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        <Input
                          type="time"
                          value={event.endTime}
                          onChange={(e) =>
                            handleInputChange("endTime", e.target.value)
                          }
                          disabled={isDateTimeDisabled}
                          className={`flex-1 border-gray-200 focus:ring-blue-500 ${
                            isDateTimeDisabled
                              ? "bg-gray-100 cursor-not-allowed"
                              : formErrors.time
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {formErrors.time && !isDateTimeDisabled && (
                        <p className="text-sm text-red-500">
                          {formErrors.time}
                        </p>
                      )}
                    </div>

                    {/* Conditional rendering for date or recurring days */}
                    {!event.isRecurring ? (
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Date <span className="text-red-500">*</span>
                          {isDateTimeDisabled && (
                            <span className="text-xs text-amber-600 ml-2">
                              ({getDateTimeDisabledReason()})
                            </span>
                          )}
                        </label>
                        <Input
                          type="date"
                          value={
                            event.date
                              ? new Date(event.date).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          disabled={isDateTimeDisabled}
                          className={`mt-2 border-gray-200 focus:ring-blue-500 ${
                            isDateTimeDisabled
                              ? "bg-gray-100 cursor-not-allowed"
                              : formErrors.date
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {formErrors.date && !isDateTimeDisabled && (
                          <p className="text-sm text-red-500 mt-1">
                            {formErrors.date}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          Recurring Days <span className="text-red-500">*</span>
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
                        {formErrors.days && (
                          <p className="text-sm text-red-500 mt-1">
                            {formErrors.days}
                          </p>
                        )}
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
                          className={`border-gray-200 focus:ring-blue-500 ${
                            formErrors.meetingLink ? "border-red-500" : ""
                          }`}
                        />
                        <Button variant="outline" size="icon">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {formErrors.meetingLink && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.meetingLink}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Event Type
                      </label>
                      <div className="mt-2">
                        <Select
                          value={event.eventType || "meeting"}
                          onValueChange={(value) =>
                            handleInputChange("eventType", value)
                          }
                        >
                          <SelectTrigger className="border-gray-200 focus:ring-blue-500">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="exercise">Exercise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}

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
                      {!event.isRecurring && isScheduled && (
                        <span className="block mt-1 text-amber-600">
                          Cannot delete events scheduled for today or tomorrow
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!event.isRecurring && isScheduled}
                    className={
                      !event.isRecurring && isScheduled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                    title={
                      !event.isRecurring && isScheduled
                        ? "Cannot delete events scheduled for today or tomorrow"
                        : ""
                    }
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
