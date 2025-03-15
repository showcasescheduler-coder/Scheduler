"use client";
import React, { useState, useEffect } from "react";
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
  Clock,
  LinkIcon,
  Calendar,
  Circle,
  RepeatIcon,
} from "lucide-react";
import { Event, EventTask } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import { Day, Block } from "@/app/context/models";
import { useRouter } from "next/navigation";
import {
  timeToMinutes,
  isTimeWithinRange,
  doTimesOverlap,
  validateTimeRange,
} from "@/helpers/timeValidation";
import toast from "react-hot-toast";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string | null;
  updateDay: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  blockId,
  updateDay,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("newEvent");
  const { setBlocks, day, setDay } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
    eventType: "meeting", // Default type
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const { isPreviewMode, setPreviewSchedule, previewSchedule } =
    useAppContext();

  const allowedStart = "00:00";
  const allowedEnd = "23:59";

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `/api/get-events-for-modal?userId=${userId}&date=${day.date}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      console.log("events", data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "existingEvent" && isOpen) {
      fetchEvents();
    }
  }, [activeTab, isOpen, day.blocks, previewSchedule?.blocks]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewEventSubmit = async () => {
    setIsSubmitting(true);

    // Validate the form first
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    const errorMessage = validateTimeRange(
      newEvent,
      isPreviewMode ? previewSchedule?.blocks || [] : day.blocks,
      allowedStart,
      allowedEnd
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    if (isPreviewMode) {
      try {
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

        // Create temporary IDs for new block and event
        const tempBlockId = `temp-block-${previewSchedule.blocks.length}`;
        const tempEventId = `temp-event-${Date.now()}`;

        // Create the block for the event
        const newBlock = {
          _id: tempBlockId,
          name: newEvent.name,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          status: "pending",
          blockType: "meeting",
          meetingLink: newEvent.meetingLink,
          description: newEvent.description,
          event: tempEventId,
          tasks: [],
          isEvent: true,
        };

        // Create the event
        const newEventObj = {
          _id: tempEventId,
          ...newEvent,
          block: tempBlockId,
          date: day.date,
        };

        // Add block to schedule
        const updatedBlocks = [...previewSchedule.blocks, newBlock];
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        // Save to localStorage
        localStorage.setItem("schedule", JSON.stringify(updatedSchedule));

        // Update UI state
        setPreviewSchedule(updatedSchedule);
        setEvents((prevEvents) => [
          ...prevEvents,
          newEventObj as unknown as Event,
        ]);
        toast.success("Event added to preview schedule");

        // Clear form and close modal
        setNewEvent({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          meetingLink: "",
          eventType: "meeting", // Default type
        });
        onClose();
      } catch (error) {
        console.error("Error adding event in preview mode:", error);
        toast.error("Failed to add event to preview");
      }
    } else {
      try {
        const response = await fetch("/api/events/with-block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newEvent,
            dayId: day._id,
            date: day.date,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create event with block");
        }

        const data = await response.json();
        setDay((prevDay) => ({
          ...prevDay,
          blocks: [...prevDay.blocks, data.block],
        }));

        setEvents((prevEvents) => [...prevEvents, data.event]);
        updateDay();
        fetchEvents();

        setNewEvent({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          meetingLink: "",
          eventType: "meeting", // Default type
        });
        setIsSubmitting(false);
        onClose();
      } catch (error) {
        console.error("Error creating event with block:", error);
        toast.error("Failed to create event");
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Check if name is empty
    if (!newEvent.name.trim()) {
      errors.name = "Event name is required";
    }

    // Check if start time is provided
    if (!newEvent.startTime) {
      errors.startTime = "Start time is required";
    }

    // Check if end time is provided
    if (!newEvent.endTime) {
      errors.endTime = "End time is required";
    }

    // Check if start time is before end time
    if (
      newEvent.startTime &&
      newEvent.endTime &&
      newEvent.startTime >= newEvent.endTime
    ) {
      errors.endTime = "End time must be after start time";
    }

    // Validate meeting link if provided (optional basic URL validation)
    if (newEvent.meetingLink && !isValidUrl(newEvent.meetingLink)) {
      errors.meetingLink = "Please enter a valid URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      // Simple check: either empty (which is valid since it's optional)
      // or starts with http:// or https://
      if (!url.trim()) return true;
      return url.startsWith("http://") || url.startsWith("https://");
    } catch (e) {
      return false;
    }
  };

  const addEventToBlock = async (
    eventId: string,
    isRecurring: boolean = false
  ) => {
    const eventToAdd = events.find((e) => e._id === eventId);
    if (!eventToAdd) {
      toast.error("Event not found");
      return;
    }

    const errorMessage = validateTimeRange(
      { startTime: eventToAdd.startTime, endTime: eventToAdd.endTime },
      isPreviewMode ? previewSchedule?.blocks || [] : day.blocks,
      allowedStart,
      allowedEnd
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    if (isPreviewMode) {
      try {
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

        // Create temporary block ID
        const tempBlockId = `temp-block-${previewSchedule.blocks.length}`;

        // Create the block for the existing event
        const newBlock = {
          _id: tempBlockId,
          name: eventToAdd.name,
          startTime: eventToAdd.startTime,
          endTime: eventToAdd.endTime,
          status: "pending",
          blockType: "meeting",
          meetingLink: eventToAdd.meetingLink,
          description: eventToAdd.description,
          event: eventId,
          tasks: [],
          isEvent: true,
          isRecurringInstance: isRecurring,
        };

        // Add block to schedule
        const updatedBlocks = [...previewSchedule.blocks, newBlock];
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        // Save to localStorage
        localStorage.setItem("schedule", JSON.stringify(updatedSchedule));

        // Update UI state
        setPreviewSchedule(updatedSchedule);

        // Only mark non-recurring events as "assigned" in the UI
        if (!isRecurring) {
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId ? { ...event, block: tempBlockId } : event
            )
          );
        }

        toast.success("Event added to preview schedule");
        onClose();
      } catch (error) {
        console.error("Error adding event in preview mode:", error);
        toast.error("Failed to add event to preview");
      }
    } else {
      try {
        const res = await fetch(`/api/add-event-to-block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: eventId,
            dayId: day._id,
            date: day.date,
            isRecurringInstance: isRecurring,
            meetingLink: eventToAdd.meetingLink, // Mak
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create block for event");
        }

        const data = await res.json();

        // Only mark non-recurring events as "assigned" in the UI
        if (!isRecurring) {
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId
                ? { ...event, block: data.block._id }
                : event
            )
          );
        }

        setDay((prevDay) => ({
          ...prevDay,
          blocks: [...prevDay.blocks, data.block],
        }));

        updateDay();
        onClose();
      } catch (error) {
        console.error("Error creating block for event:", error);
        toast.error("Failed to add event");
      }
    }
  };

  // Check if an event is already scheduled for today
  const isEventScheduledForToday = (event: Event) => {
    if (!event.isRecurring) {
      // For non-recurring events, check if it has a block and that block exists in the day's blocks
      if (!event.block) return false;

      // Check if the block still exists in the current day's blocks
      const blockExists = isPreviewMode
        ? (previewSchedule?.blocks || []).some(
            (block) => block._id === event.block
          )
        : day.blocks.some((block) => block._id === event.block);

      return blockExists;
    }

    // For recurring events, check if there's a block with this event's ID in the current day
    const hasBlockForRecurringEvent = isPreviewMode
      ? (previewSchedule?.blocks || []).some(
          (block) => block.event === event._id
        )
      : day.blocks.some((block) => block.event === event._id);

    return hasBlockForRecurringEvent;
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border rounded-lg shadow-lg">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="h-4 w-4 text-blue-600" />
            <DialogTitle className="text-base font-medium">
              Add Event
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="newEvent"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-6 mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="newEvent" className="flex-1">
                New Event
              </TabsTrigger>
              <TabsTrigger value="existingEvent" className="flex-1">
                Event Bank
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="newEvent" className="px-6 space-y-4">
            <div className="space-y-2">
              <Input
                id="event-name"
                name="name"
                placeholder="Event name"
                value={newEvent.name}
                onChange={handleInputChange}
                className="h-9"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Event description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                className="h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  type="time"
                  name="startTime"
                  placeholder="Start time"
                  value={newEvent.startTime}
                  onChange={handleInputChange}
                  className="h-9"
                />
                {formErrors.startTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.startTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="time"
                  name="endTime"
                  placeholder="End time"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                  className="h-9"
                />
                {formErrors.endTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.endTime}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={newEvent.eventType}
                onValueChange={handleSelectChange("eventType")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">
                    <span style={{ color: "#0284c7" }}>Meeting</span>
                  </SelectItem>
                  <SelectItem value="health">
                    <span style={{ color: "#0d9488" }}>Health</span>
                  </SelectItem>
                  <SelectItem value="personal">
                    <span style={{ color: "#c026d3" }}>Personal</span>
                  </SelectItem>
                  <SelectItem value="exercise">
                    <span style={{ color: "#059669" }}>Exercise</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="relative flex items-center">
                <LinkIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  name="meetingLink"
                  placeholder="Meeting link (optional)"
                  value={newEvent.meetingLink}
                  onChange={handleInputChange}
                  className="h-9 pl-8"
                />
              </div>
              {formErrors.meetingLink && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.meetingLink}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={onClose} className="h-9">
                Cancel
              </Button>
              <Button
                onClick={handleNewEventSubmit}
                className="h-9 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Adding..." : "Add Event"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="existingEvent">
            <ScrollArea className="h-[400px] border-t border-b">
              <div className="px-6 py-4 space-y-3">
                {events.length > 0 ? (
                  events.map((event) => (
                    <Card
                      key={event._id}
                      className={`border ${
                        isEventScheduledForToday(event) ? "opacity-50" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              {event.name}
                            </h4>
                            {event.isRecurring && (
                              <Badge
                                variant="outline"
                                className="text-xs flex items-center gap-1"
                              >
                                <RepeatIcon className="h-3 w-3" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.startTime} - {event.endTime}
                          </p>
                          {event.isRecurring && event.days && (
                            <p className="text-xs text-gray-500">
                              Repeats on:{" "}
                              {event.days
                                .map(
                                  (day) =>
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                )
                                .join(", ")}
                            </p>
                          )}
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              Join Meeting
                            </a>
                          )}
                          {event.tasks && event.tasks.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                              {event.tasks.map((task: EventTask) => (
                                <li
                                  key={task._id}
                                  className="flex items-center text-xs text-gray-600"
                                >
                                  <Circle className="h-2 w-2 mr-2 text-gray-400" />
                                  <span>{task.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 shrink-0"
                            onClick={() =>
                              addEventToBlock(event._id, !!event.isRecurring)
                            }
                            disabled={isEventScheduledForToday(event)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            {isEventScheduledForToday(event)
                              ? "Assigned"
                              : "Add"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] px-6">
                    <div className="rounded-full bg-blue-50 p-3 mb-4">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      No events yet
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-6">
                      Create your first event to add it to your schedule
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/events")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create an Event
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
