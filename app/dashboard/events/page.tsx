"use client";
import React, { useEffect, useState } from "react";
import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar as CalendarIcon,
  Repeat,
  BarChart2,
  Plus,
  MoreHorizontal,
  Clock,
  Users,
  Video,
  Menu,
  ChevronDown,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/app/components/SideBar";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import MobileNav from "@/app/components/MobileNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventType = "meeting" | "appointment";
type EventStatus = "upcoming" | "completed" | "cancelled";
type EventFrequency = "one-off" | "recurring";

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string | null;
  priority: string;
  isRecurring: boolean;
  days: string[];
  meetingLink: string | null;
  status: string;
  completed: boolean; // Add this field
}

interface NewEvent {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  days: string[];
  meetingLink: string;
  eventType: "meeting" | "personal" | "health" | "exercise";
}

type GroupedEvents = {
  [key: string]: Event[];
};

// Change the StatusFilter type
type StatusFilter = "upcoming" | "past" | "completed";
type FrequencyFilter = "all" | EventFrequency;

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const [frequencyFilter, setFrequencyFilter] = useState<
    "all" | "one-off" | "recurring"
  >("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();
  const [newEvent, setNewEvent] = useState<NewEvent>({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
    days: [],
    meetingLink: "",
    eventType: "meeting",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    date: "",
    time: "",
    days: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/events?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));

    // Clear time errors when either time changes
    if (formErrors.time) {
      setFormErrors((prev) => ({
        ...prev,
        time: "",
      }));
    }
  };

  const handleRecurringChange = (value: string) => {
    setNewEvent((prev) => ({ ...prev, isRecurring: value === "recurring" }));

    // Clear days error when switching between recurring/single
    if (formErrors.days) {
      setFormErrors((prev) => ({
        ...prev,
        days: "",
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setNewEvent((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));

    // Clear days error when selecting days
    if (formErrors.days) {
      setFormErrors((prev) => ({
        ...prev,
        days: "",
      }));
    }
  };
  const handleAddEvent = async () => {
    // Reset errors
    setFormErrors({
      name: "",
      date: "",
      time: "",
      days: "",
    });

    // Validation flags
    let isValid = true;
    const newErrors = {
      name: "",
      date: "",
      time: "",
      days: "",
    };

    // Name is required
    if (!newEvent.name.trim()) {
      newErrors.name = "Event name is required";
      isValid = false;
    }

    // Single event validations
    if (!newEvent.isRecurring) {
      // Date is required and cannot be in the past
      if (!newEvent.date) {
        newErrors.date = "Date is required";
        isValid = false;
      } else {
        const selectedDate = new Date(newEvent.date);
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
      if (newEvent.days.length === 0) {
        newErrors.days = "Please select at least one day";
        isValid = false;
      }
    }

    // Time validations
    if (!newEvent.startTime) {
      newErrors.time = "Start time is required";
      isValid = false;
    } else if (!newEvent.endTime) {
      newErrors.time = "End time is required";
      isValid = false;
    } else if (newEvent.startTime >= newEvent.endTime) {
      newErrors.time = "End time must be after start time";
      isValid = false;
    }

    // For single events, check if date+time is in the past
    if (!newEvent.isRecurring && newEvent.date && newEvent.startTime) {
      const eventDateTime = new Date(newEvent.date);
      const [hours, minutes] = newEvent.startTime.split(":").map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);

      if (eventDateTime < new Date()) {
        newErrors.time = "Event time cannot be in the past";
        isValid = false;
      }
    }

    // If validation fails, update errors and return
    if (!isValid) {
      setFormErrors(newErrors);
      return;
    }

    // Continue with form submission if validation passes
    try {
      const eventData = {
        name: newEvent.name,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        isRecurring: newEvent.isRecurring,
        status: "upcoming",
        meetingLink: newEvent.meetingLink || null,
        eventType: newEvent.eventType,
        ...(newEvent.isRecurring
          ? { days: newEvent.days }
          : { date: newEvent.date }),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...eventData }),
      });

      if (!response.ok) throw new Error("Failed to add event");

      const result = await response.json();
      console.log("i got the result back", result);
      setEvents((prev) => [...prev, result]);
      setIsDialogOpen(false);
      setNewEvent({
        name: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        isRecurring: false,
        days: [],
        meetingLink: "",
        eventType: "meeting",
      });
      toast.success("Event added successfully");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  // Modify the filtering logic
  const filteredEvents = events.filter((event) => {
    const now = new Date();

    // First check if the event matches the frequency filter
    const matchesFrequency =
      frequencyFilter === "all" ||
      (frequencyFilter === "recurring"
        ? event.isRecurring
        : !event.isRecurring);

    // If it doesn't match the frequency, filter it out immediately
    if (!matchesFrequency) return false;

    // Handle completed events tab
    if (statusFilter === "completed") {
      return event.completed === true;
    }

    // For upcoming and past tabs, we only want to show non-completed events
    if (event.completed) {
      return false;
    }

    if (event.isRecurring) {
      // Recurring events should always show in upcoming tab (unless completed)
      return statusFilter === "upcoming";
    }

    // // Handle recurring events
    // if (event.isRecurring) {
    //   // For recurring events, we need to check if it occurs today and its time
    //   const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    //   const daysOfWeek = {
    //     Sunday: 0,
    //     Monday: 1,
    //     Tuesday: 2,
    //     Wednesday: 3,
    //     Thursday: 4,
    //     Friday: 5,
    //     Saturday: 6,
    //   };

    //   // Check if this recurring event happens today
    //   const happensTodayIndex = event.days.findIndex(
    //     (day) => daysOfWeek[day as keyof typeof daysOfWeek] === today
    //   );

    //   if (happensTodayIndex !== -1) {
    //     // Event happens today, check if time has passed
    //     const [eventHours, eventMinutes] = event.endTime.split(":").map(Number);
    //     const eventEndTimeToday = new Date();
    //     eventEndTimeToday.setHours(eventHours, eventMinutes, 0, 0);

    //     const isPast = now > eventEndTimeToday;
    //     return statusFilter === "past" ? isPast : !isPast;
    //   }

    //   // If event doesn't happen today, it's not "past" for today
    //   return statusFilter === "past" ? false : true;
    // }

    // For non-recurring events
    // Create date objects that include both date and time
    const eventDate = new Date(event.date);
    const [eventHours, eventMinutes] = event.endTime.split(":").map(Number);
    eventDate.setHours(eventHours, eventMinutes, 0, 0);

    // Check if the date+time is in the past
    const isPast = eventDate < now;
    const matchesStatus = statusFilter === "past" ? isPast : !isPast;

    return matchesStatus;
  });
  // The rest of your groupedEvents logic remains the same
  const groupedEvents = filteredEvents.reduce<GroupedEvents>((acc, event) => {
    let date;
    if (event.isRecurring) {
      date = "Recurring";
    } else if (event.date) {
      // Check if date exists before trying to format it
      date = format(parseISO(event.date), "MMM d, yyyy");
    } else {
      // Fallback for events missing a date
      date = "No Date";
    }

    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading events...
      </div>
    );

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1">
        <div className="md:hidden px-4 py-2 border-b border-gray-200">
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

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Events</h1>
              <p className="text-sm text-gray-500">
                Manage your meetings and appointments
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new event.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        name="name"
                        value={newEvent.name}
                        onChange={handleInputChange}
                        className={`${formErrors.name ? "border-red-500" : ""}`}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Event Type</Label>
                    <RadioGroup
                      defaultValue="single"
                      onValueChange={handleRecurringChange}
                      className="col-span-3 flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single Date</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recurring" id="recurring" />
                        <Label htmlFor="recurring">Recurring</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {newEvent.isRecurring ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Days <span className="text-red-500">*</span>
                      </Label>
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <div key={day} className="flex items-center">
                              <Checkbox
                                id={day}
                                checked={newEvent.days.includes(day)}
                                onCheckedChange={() => handleDayToggle(day)}
                              />
                              <Label htmlFor={day} className="ml-2">
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {formErrors.days && (
                          <p className="text-sm text-red-500 mt-1">
                            {formErrors.days}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={newEvent.date}
                          onChange={handleInputChange}
                          className={`${
                            formErrors.date ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.date && (
                          <p className="text-sm text-red-500 mt-1">
                            {formErrors.date}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) =>
                          handleTimeChange("startTime", e.target.value)
                        }
                        className={`${formErrors.time ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) =>
                          handleTimeChange("endTime", e.target.value)
                        }
                        className={`${formErrors.time ? "border-red-500" : ""}`}
                      />
                      {formErrors.time && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Event Type</Label>
                  <Select
                    value={newEvent.eventType}
                    onValueChange={handleSelectChange("eventType")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">
                        <span style={{ color: "#0284c7" }}>Meeting</span>
                      </SelectItem>
                      <SelectItem value="personal">
                        <span style={{ color: "#c026d3" }}>Personal</span>
                      </SelectItem>
                      <SelectItem value="health">
                        <span style={{ color: "#0d9488" }}>Health</span>
                      </SelectItem>
                      <SelectItem value="exercise">
                        <span style={{ color: "#059669" }}>Exercise</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meetingLink" className="text-right">
                    Meeting Link
                  </Label>
                  <div className="col-span-3 relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="meetingLink"
                      name="meetingLink"
                      placeholder="https://..."
                      value={newEvent.meetingLink}
                      onChange={handleInputChange}
                      className="pl-9"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                    onClick={handleAddEvent}
                  >
                    Add Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              className="w-full md:w-auto"
            >
              <TabsList className="h-9 w-full md:w-auto bg-transparent border border-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="upcoming"
                  className="flex-1 md:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="flex-1 md:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Past
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex-1 md:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto h-9">
                  {frequencyFilter === "all"
                    ? "All Events"
                    : frequencyFilter === "recurring"
                    ? "Recurring"
                    : "One-off"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[--trigger-width] md:w-auto"
              >
                <DropdownMenuItem onClick={() => setFrequencyFilter("all")}>
                  All Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFrequencyFilter("one-off")}>
                  One-off
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFrequencyFilter("recurring")}
                >
                  Recurring
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                <div className="space-y-4">
                  {dateEvents.map((event) => (
                    <Card key={event._id} className="group">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
                          <div className="space-y-1">
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                              <span className="text-base font-medium">
                                {event.name}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {event.meetingLink && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Virtual
                                  </span>
                                )}
                                {event.isRecurring && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                    {event.days?.join(", ")}
                                  </span>
                                )}
                                {!event.isRecurring && event.completed && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.startTime} - {event.endTime}
                              </div>
                              {event.description && (
                                <div className="text-gray-500">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-start">
                            {event.meetingLink && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full md:w-auto"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 opacity-100 md:opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/events/${event._id}`
                                    )
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(event._id)}
                                  className="text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedEvents).length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No events found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
