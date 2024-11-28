"use client";
import React, { useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Event } from "@/app/context/models";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { set } from "mongoose";
import { start } from "repl";

interface Props {
  params: { id: string };
}

const EventDetailsPage = ({ params: { id } }: Props) => {
  const { events, updateEvent } = useAppContext();
  const [date, setDate] = React.useState<Date | undefined>();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [time, setTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [status, setStatus] = React.useState<"draft" | "active" | "archived">(
    "draft"
  );
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const event = await response.json();
        setDate(new Date(event.date));
        setName(event.name);
        setDescription(event.description);
        setTime(event.startTime);
        setEndTime(event.endTime);
        setDuration(event.duration);
        setStatus(event.status || "draft");
      } catch (error) {
        console.error("Error fetching event:", error);
        // Handle error (e.g., show error message to user)
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleSave = async () => {
    if (!date) return; // Handle this error appropriately
    const updatedEvent = {
      name,
      description,
      date: format(date, "yyyy-MM-dd"),
      startTime: time,
      endTime,
      duration,
      status,
    };

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEventData = await response.json();
      // Update local state or context if needed
      updateEvent(id, updatedEventData);

      // Show success message to user
      alert("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      // Show error message to user
      alert("Failed to update event. Please try again.");
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.push("/dashboard/events")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Projects</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Event Details
          </h1>
          {/* <Badge variant="outline" className="ml-auto sm:ml-0">
            {status}
          </Badge> */}
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            {/* <Button variant="outline" size="sm">
              Discard
            </Button> */}
            <Button size="sm" onClick={handleSave}>
              Save Event
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Event Detail</CardTitle>
                <CardDescription>
                  Update the details of your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      type="text"
                      className="w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Event Description</Label>
                    <Textarea
                      id="description"
                      className="min-h-32"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="date">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="time">Event Start Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="duration">End Time</Label>
                    <Input
                      id="duration"
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Event Status</CardTitle>
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Archive Event</CardTitle>
                <CardDescription>
                  {"Archive this event if it's no longer needed."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatus("archived")}
                >
                  Archive Event
                </Button>
              </CardContent>
            </Card>
          </div> */}
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
          {/* <Button variant="outline" size="sm">
            Discard
          </Button> */}
          <Button size="sm" onClick={handleSave}>
            Save Event
          </Button>
        </div>
      </div>
    </main>
  );
};

export default EventDetailsPage;
