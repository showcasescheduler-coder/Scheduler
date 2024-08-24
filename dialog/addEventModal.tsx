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
import { PlusCircle, CheckCircle } from "lucide-react";
import { Event } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";

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

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
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
    if (activeTab === "existingEvent") {
      fetchEvents();
    }
  }, [activeTab]);

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
    const newEventObj = {
      ...newEvent,
      date: day.date,
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
    try {
      const res = await fetch(`/api/blocks/${blockId}`, {
        method: "POST",
        body: JSON.stringify({ eventId: eventId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to add event to block");
      }
      const data = await res.json();
      console.log("event added to block", data);

      setEvents((prevEvents: Event[]) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, block: blockId } : event
        )
      );

      updateDay();
    } catch (error) {
      console.error("Error adding event to block:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="newEvent"
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="newEvent">New Event</TabsTrigger>
            <TabsTrigger value="existingEvent">Event Bank</TabsTrigger>
          </TabsList>
          <TabsContent value="newEvent">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="event-name"
                  name="name"
                  placeholder="Event name"
                  value={newEvent.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Event description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="time"
                  name="startTime"
                  placeholder="Start time"
                  value={newEvent.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="time"
                  name="endTime"
                  placeholder="End time"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={newEvent.priority}
                  onValueChange={handleSelectChange("priority")}
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
            </div>
          </TabsContent>
          <TabsContent value="existingEvent">
            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="p-4 space-y-4">
                {events.map((event) => (
                  <Card
                    key={event._id}
                    className={event.block ? "opacity-50" : ""}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{event.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => addEventToBlock(event._id)}
                        disabled={!!event.block}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {event.block ? "Assigned" : "Add"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleNewEventSubmit}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
