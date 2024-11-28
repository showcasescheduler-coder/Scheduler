"use client";
import React from "react";
import {
  Plus,
  Calendar,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  Clock,
  CalendarRange,
  PlayCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        <Calendar className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Repeat className="h-5 w-5 text-blue-600" />
        <BarChart2 className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
}

export default function RoutinesPage() {
  const routines = [
    {
      id: 1,
      title: "Morning Routine",
      description: "Start the day right",
      schedule: "Weekdays",
      time: "06:00 - 07:30",
      streak: 15,
      completion: 85,
      lastCompleted: "Today",
      tasks: { completed: 6, total: 7 },
      status: "Active",
    },
    {
      id: 2,
      title: "Evening Workout",
      description: "Stay fit and healthy",
      schedule: "Mon, Wed, Fri",
      time: "18:00 - 19:00",
      streak: 8,
      completion: 100,
      lastCompleted: "Yesterday",
      tasks: { completed: 5, total: 5 },
      status: "Active",
    },
    {
      id: 3,
      title: "Weekly Review",
      description: "Review goals and plan ahead",
      schedule: "Sunday",
      time: "19:00 - 20:00",
      streak: 4,
      completion: 0,
      lastCompleted: "Last Week",
      tasks: { completed: 0, total: 8 },
      status: "Active",
    },
  ];

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1">
        <div className="h-full p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Routines</h1>
                <p className="text-sm text-gray-500">
                  Manage your daily and weekly routines
                </p>
              </div>
              <Button className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                New Routine
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1 w-full sm:w-auto">
              <TabsTrigger
                value="all"
                className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Weekly
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {routine.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">{routine.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completion Rate</span>
                      <span className="font-medium">{routine.completion}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${routine.completion}%` }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4" />
                          {routine.schedule}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {routine.time}
                        </div>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <div className="flex items-center gap-2">
                          <Repeat className="h-4 w-4" />
                          {routine.streak} day streak
                        </div>
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          {routine.lastCompleted}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <ListTodo className="h-4 w-4 mr-2" />
                      {routine.tasks.completed}/{routine.tasks.total} Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
