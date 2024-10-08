"use client";
import React, { useEffect, useState } from "react";
import { File, ListFilter, MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/app/context/AppContext";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-hot-toast";
import { Event } from "@/app/context/models";

interface NewEvent {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  days: string[]; // Changed from never[] to string[]
}

const EventsPage = () => {
  const { events, addEvent, userData, setEvents } = useAppContext();
  const { userId } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const [newEvent, setNewEvent] = useState<NewEvent>({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
    days: [], // Initialize as an empty array of strings
  });
  const [isLoading, setIsLoading] = useState(true);
  const [eventType, setEventType] = useState("one-off");

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) return;
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userId, setEvents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecurringChange = (value: string) => {
    setNewEvent((prev) => ({ ...prev, isRecurring: value === "recurring" }));
  };

  const handleDayToggle = (day: string) => {
    setNewEvent((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleAddEvent = async () => {
    if (
      !newEvent.name ||
      !newEvent.description ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (newEvent.isRecurring && newEvent.days.length === 0) {
      toast.error("Please select at least one day for recurring events.");
      return;
    }

    if (!newEvent.isRecurring && !newEvent.date) {
      toast.error("Please select a date for single events.");
      return;
    }

    try {
      const eventData = {
        name: newEvent.name,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        isRecurring: newEvent.isRecurring,
        ...(newEvent.isRecurring
          ? { days: newEvent.days }
          : { date: newEvent.date }),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, // Separate from eventData
          ...eventData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add event");
      }

      const result = await response.json();
      console.log("Event added:", result);

      // Reset the form and close the dialog
      setNewEvent({
        name: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        isRecurring: false,
        days: [],
      });
      setIsDialogOpen(false);

      toast.success("Event added successfully.");

      // Refresh the events list
      const updatedEvents = await fetch(`/api/events?userId=${userId}`).then(
        (res) => res.json()
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event. Please try again.");
    }
  };

  const handleEdit = (taskId: string) => {
    router.push(`/dashboard/events/${taskId}`);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove the deleted event from the local state
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );

      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const oneOffEvents = events.filter((event) => !event.isRecurring);
  const recurringEvents = events.filter((event) => event.isRecurring);

  const renderEventRow = (event: Event) => (
    <TableRow key={event._id}>
      <TableCell className="font-medium">
        <Link href={`/dashboard/events/${event._id}`}>{event.name}</Link>
      </TableCell>
      <TableCell className="hidden sm:table-cell font-medium">
        {event.description}
      </TableCell>
      <TableCell>
        {event.isRecurring
          ? event.days.join(", ")
          : format(parseISO(event.date), "yyyy-MM-dd")}
      </TableCell>
      <TableCell>{event.startTime}</TableCell>
      <TableCell className="hidden md:table-cell">{event.endTime}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(event._id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(event._id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return <div>Loading events...</div>; // Or use a more sophisticated loading component
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Active Events</TabsTrigger>
            <TabsTrigger value="active">Completed</TabsTrigger>
            {/* <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger> */}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button> */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Event
                  </span>
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
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newEvent.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
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
                      <Label className="text-right">Days</Label>
                      <div className="col-span-3 flex flex-wrap gap-2">
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={newEvent.date}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddEvent}>
                    Add Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Manage your Meetings and Appointments
              </CardDescription>
              <Tabs value={eventType} onValueChange={setEventType}>
                <TabsList>
                  <TabsTrigger value="one-off">One-off Events</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring Events</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead>
                      {eventType === "one-off" ? "Date" : "Days"}
                    </TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead className="hidden md:table-cell">
                      End Time
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventType === "one-off"
                    ? oneOffEvents.map(renderEventRow)
                    : recurringEvents.map(renderEventRow)}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <strong>
                  1-
                  {eventType === "one-off"
                    ? oneOffEvents.length
                    : recurringEvents.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {eventType === "one-off"
                    ? oneOffEvents.length
                    : recurringEvents.length}
                </strong>{" "}
                events
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default EventsPage;
