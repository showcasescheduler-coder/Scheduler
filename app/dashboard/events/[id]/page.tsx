"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Video,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  Menu,
  MapPin,
  Link as LinkIcon,
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

interface EventDetailsProps {
  params: { id: string };
}

export default function EventDetails({ params: { id } }: EventDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<{
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    days: string[];
    meetingLink: string | null;
    status: string;
  } | null>(null);

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

  const handleInputChange = (field: string, value: any) => {
    if (!event) return;
    setEvent((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

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

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-16 p-0">
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
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
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
      </div>
    </div>
  );
}
