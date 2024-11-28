"use client";
import React from "react";
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
        <Calendar className="h-5 w-5 text-blue-600" />
        <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <BarChart2 className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
}

export default function EventDetails() {
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
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      Team Weekly Sync
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Join button for virtual meetings */}
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button size="sm">Save Changes</Button>
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
                        <Clock className="h-4 w-4" />
                        <span>10:00 AM - 11:00 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Every Monday</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>8 attendees</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Select defaultValue="upcoming">
                      <SelectTrigger>
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
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Title</label>
                    <Input defaultValue="Team Weekly Sync" className="mt-2" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      defaultValue="Weekly team sync to discuss project progress and upcoming tasks."
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="date"
                          defaultValue="2024-11-23"
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="time"
                          defaultValue="10:00"
                          className="flex-1"
                        />
                        <Input
                          type="time"
                          defaultValue="11:00"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="virtual" className="text-sm font-medium">
                        Virtual Meeting
                      </Label>
                      <Switch id="virtual" defaultChecked />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Meeting Link
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input defaultValue="https://meet.google.com/abc-defg-hij" />
                        <Button variant="outline" size="icon">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input placeholder="Add a location (optional)" />
                        <Button variant="outline" size="icon">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="text-sm font-medium">Frequency</label>
                      <Select defaultValue="weekly">
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-off">One-off</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Attendees</label>
                      <div className="mt-2 space-y-2">
                        {/* This would typically be a more complex component for managing attendees */}
                        <Input placeholder="Add attendees by email" />
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>8 people attending</span>
                        </div>
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
                      Cancel Event
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cancel this event and notify all attendees
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Cancel Event
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
