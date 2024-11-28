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
import { PlusCircle, CheckCircle, Clock } from "lucide-react";
import { Event } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import { Day, Block } from "@/app/context/models";

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
  const [activeTab, setActiveTab] = useState<string>("newEvent");
  const { setBlocks, day, setDay } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    priority: "",
    startTime: "",
    endTime: "",
  });
  const { userId } = useAuth();

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

    const newEventObj = {
      ...newEvent,
      date: day.date,
      userId, // Include the userId in the request
    };

    try {
      const response = await fetch("/api/events/with-block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newEventObj,
          dayId: day._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event with block");
      }

      const data = await response.json();
      console.log("New event and block created:", data);

      // Update the day data in the context
      setDay((prevDay) => ({
        ...prevDay,
        blocks: [...prevDay.blocks, data.block],
      }));

      // Clear the form
      setNewEvent({
        name: "",
        description: "",
        startTime: "",
        endTime: "",
        priority: "",
      });

      // Close the modal
      onClose();

      // Update the day view
      updateDay();
    } catch (error) {
      console.error("Error creating new event and block:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const addEventToBlock = async (eventId: string) => {
    if (!day._id) {
      console.error("Day ID is not available");
      return;
    }

    console.log("Creating block for event:", eventId);

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
      <DialogContent className="sm:max-w-[400px] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
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
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="newEvent" className="flex-1">
                New Event
              </TabsTrigger>
              <TabsTrigger value="existingEvent" className="flex-1">
                Event Bank
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="newEvent" className="p-6 pt-4 space-y-4">
            <div className="space-y-2">
              <Input
                id="event-name"
                name="name"
                placeholder="Event name"
                value={newEvent.name}
                onChange={handleInputChange}
                className="h-8"
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
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="time"
                  name="endTime"
                  placeholder="End time"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                  className="h-8"
                />
              </div>
            </div>
            <Select
              value={newEvent.priority}
              onValueChange={handleSelectChange("priority")}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={onClose} className="h-8">
                Cancel
              </Button>
              <Button
                onClick={handleNewEventSubmit}
                className="h-8 bg-blue-600 hover:bg-blue-700"
              >
                Add Event
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="existingEvent">
            <ScrollArea className="h-72">
              <div className="px-6 py-4 space-y-3">
                {events.length > 0 ? (
                  events.map((event) => (
                    <Card
                      key={event._id}
                      className={event.block ? "opacity-50" : ""}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{event.name}</h4>
                          <p className="text-xs text-gray-500">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.startTime} - {event.endTime}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
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
                  <p className="text-center text-sm text-gray-500">
                    No events found for this date.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
