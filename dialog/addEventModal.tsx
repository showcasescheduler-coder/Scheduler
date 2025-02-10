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
} from "lucide-react";
import { Event } from "@/app/context/models";
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
    meetingLink: "", // New field for meeting link
  });
  const { userId } = useAuth();

  const allowedStart = "08:00";
  const allowedEnd = "22:00";

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
    if (activeTab === "existingEvent" && day.date) {
      fetchEvents();
    }
  }, [activeTab, day.date]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewEventSubmit = async () => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    const errorMessage = validateTimeRange(
      newEvent,
      day.blocks,
      allowedStart,
      allowedEnd
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    const newEventObj = {
      ...newEvent,
      date: day.date,
      userId,
    };

    try {
      const response = await fetch("/api/events/with-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEventObj, dayId: day._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event with block");
      }

      const data = await response.json();
      console.log("New event and block created:", data);

      // Update the global day state (for blocks)
      setDay((prevDay) => ({
        ...prevDay,
        blocks: [...prevDay.blocks, data.block],
      }));

      // Update the events state locally if needed.
      setEvents((prevEvents) => [...prevEvents, data.event]);

      // Immediately revalidate both day data and events list:
      updateDay(); // This calls mutate() to re-fetch day data.
      fetchEvents(); // Re-fetch events list for the Event Bank.

      // Clear form and close the modal.
      setNewEvent({
        name: "",
        description: "",
        startTime: "",
        endTime: "",
        meetingLink: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating new event and block:", error);
    }
  };

  const addEventToBlock = async (eventId: string) => {
    if (!day._id) {
      console.error("Day ID is not available");
      return;
    }
    // Look up the event from your events array
    const eventToAdd = events.find((e) => e._id === eventId);
    if (!eventToAdd) {
      toast.error("Event not found");
      return;
    }

    // allowedStart and allowedEnd are defined as "08:00" and "22:00"
    const errorMessage = validateTimeRange(
      { startTime: eventToAdd.startTime, endTime: eventToAdd.endTime },
      day.blocks,
      allowedStart,
      allowedEnd
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const res = await fetch(`/api/add-event-to-block`, {
        method: "POST",
        body: JSON.stringify({
          eventId: eventId,
          dayId: day._id,
          date: day.date,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to create block for event");
      }
      const data = await res.json();
      console.log("Block created for event:", data);

      // Update the events state
      setEvents((prevEvents: Event[]) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, block: data.block._id } : event
        )
      );

      // Update the day data in the context
      setDay((prevDay: Day) => ({
        ...prevDay,
        blocks: [...prevDay.blocks, data.block],
      }));

      updateDay();
      onClose(); // Close the modal after adding the event
    } catch (error) {
      console.error("Error creating block for event:", error);
    }
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
              </div>
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
            </div>
            {/* <Select
              value={newEvent.priority}
              onValueChange={handleSelectChange("priority")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select> */}

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={onClose} className="h-9">
                Cancel
              </Button>
              <Button
                onClick={handleNewEventSubmit}
                className="h-9 bg-blue-600 hover:bg-blue-700"
              >
                Add Event
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
                      className={`border ${event.block ? "opacity-50" : ""}`}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-medium">{event.name}</h4>
                          <p className="text-xs text-gray-500">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.startTime} - {event.endTime}
                          </p>
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
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 shrink-0"
                          onClick={() => addEventToBlock(event._id)}
                          disabled={!!event.block}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          {event.block ? "Assigned" : "Add"}
                        </Button>
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
