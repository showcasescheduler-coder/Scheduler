"use client";
import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type EventType = "meeting" | "appointment";
type EventStatus = "upcoming" | "completed" | "cancelled";
type EventFrequency = "one-off" | "recurring";

interface Event {
  id: number;
  title: string;
  type: EventType;
  date: string;
  time: string;
  attendees?: number;
  isVirtual?: boolean;
  location?: string;
  status: EventStatus;
  frequency: EventFrequency;
  recurrence?: string;
}

type GroupedEvents = {
  [key: string]: Event[];
};

type StatusFilter = "upcoming" | "completed";
type FrequencyFilter = "all" | EventFrequency;

// interface FrequencyOption {
//   [key in FrequencyFilter]: string;
// }

function SidebarContent() {
  return (
    <div className="flex flex-col items-center py-6 space-y-8">
      <div className="flex flex-col items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
      </div>
      <nav className="space-y-8">
        <LayoutDashboard className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <FolderKanban className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <ListTodo className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <CalendarIcon className="h-5 w-5 text-blue-600" />
        <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <BarChart2 className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
}

export default function EventsPage() {
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("upcoming");
  const [frequencyFilter, setFrequencyFilter] =
    React.useState<FrequencyFilter>("all");

  const events: Event[] = [
    {
      id: 1,
      title: "Team Weekly Sync",
      type: "meeting",
      date: "Today",
      time: "10:00 AM - 11:00 AM",
      attendees: 8,
      isVirtual: true,
      status: "upcoming",
      frequency: "recurring",
      recurrence: "Weekly",
    },
    {
      id: 2,
      title: "Client Presentation",
      type: "meeting",
      date: "Today",
      time: "2:00 PM - 3:30 PM",
      attendees: 12,
      isVirtual: true,
      status: "upcoming",
      frequency: "one-off",
    },
    {
      id: 3,
      title: "Dentist Appointment",
      type: "appointment",
      date: "Tomorrow",
      time: "9:00 AM - 10:00 AM",
      location: "Dental Clinic",
      status: "upcoming",
      frequency: "one-off",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesStatus = event.status === statusFilter;
    const matchesFrequency =
      frequencyFilter === "all" || event.frequency === frequencyFilter;
    return matchesStatus && matchesFrequency;
  });

  const groupedEvents = filteredEvents.reduce<GroupedEvents>((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  // const frequencyOptions: FrequencyOption = {
  //   all: "All Events",
  //   "one-off": "One-off",
  //   recurring: "Recurring",
  // };

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1">
        <div className="p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-4">
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

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Events</h1>
              <p className="text-sm text-gray-500">
                Manage your meetings and appointments
              </p>
            </div>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
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
                  {/* {frequencyOptions[frequencyFilter]} */}
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
                    <Card key={event.id} className="group">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
                          <div className="space-y-1">
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                              <span className="text-base font-medium">
                                {event.title}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {event.isVirtual && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Virtual
                                  </span>
                                )}
                                {event.frequency === "recurring" && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                    {event.recurrence}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </div>
                              {event.attendees && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {event.attendees} attendees
                                </div>
                              )}
                              {event.location && (
                                <div className="text-gray-500">
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-start">
                            {event.isVirtual && event.status === "upcoming" && (
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
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Cancel
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
