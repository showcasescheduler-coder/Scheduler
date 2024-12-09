"use client";
import React, { useState, useEffect } from "react";
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
  MoreHorizontal,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/app/components/SideBar";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNav from "@/app/components/MobileNav";
import { format } from "date-fns";

export interface Routine {
  _id: string;
  name: string;
  description: string;
  days: string[];
  tasks: RoutineTask[];
  block: string;
  startTime: string;
  endTime: string;
}
export interface RoutineTask extends Task {
  routineId: string;
}

export interface Task {
  _id: string;
  name: string;
  description: string;
  priority: string;
  duration: number;
  deadline: string;
  isRoutineTask: boolean;
  completed: boolean;
  block: string | null; // Allow block to be null
  project: string | null; // Allow project to be null
  routine: string | null; // Allow routine to be
  projectId: string | null;
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration"; //
}

interface NewRoutine {
  name: string;
  description: string;
  days: string[];
  startTime: string;
  endTime: string;
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const router = useRouter();
  const [newRoutine, setNewRoutine] = useState<NewRoutine>({
    name: "",
    description: "",
    days: [],
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchRoutines = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/routines?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch routines");
        const data = await response.json();
        setRoutines(data);
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast.error("Failed to load routines");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutines();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRoutine((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleAddRoutine = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRoutine, userId }),
      });

      if (!response.ok) throw new Error("Failed to create routine");

      const createdRoutine = await response.json();
      setRoutines((prev) => [...prev, createdRoutine]);
      setIsDialogOpen(false);
      setNewRoutine({
        name: "",
        description: "",
        days: [],
        startTime: "",
        endTime: "",
      });
      toast.success("Routine created successfully");
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("Failed to create routine");
    }
  };

  const handleDelete = async (routineId: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;

    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete routine");

      setRoutines((prev) =>
        prev.filter((routine) => routine._id !== routineId)
      );
      toast.success("Routine deleted successfully");
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Failed to delete routine");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading routines...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1">
        <div className="md:hidden px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <MobileNav />
              </SheetContent>
            </Sheet>

            {/* Center: Date display */}
            <div className="text-sm font-medium">
              {format(new Date(), "MMM d, yyyy")}
            </div>

            {/* Right: User button */}
            <UserButton />
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Routines</h1>
                <p className="text-sm text-gray-500">
                  Manage your daily and weekly routines
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">New Routine</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Routine</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new routine.
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
                        value={newRoutine.name}
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
                        value={newRoutine.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startTime" className="text-right">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={newRoutine.startTime}
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
                        value={newRoutine.endTime}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
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
                              checked={newRoutine.days.includes(day)}
                              onCheckedChange={() => handleDayToggle(day)}
                            />
                            <Label htmlFor={day} className="ml-2">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddRoutine}>Add Routine</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="all"
                  className="flex-1 sm:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="daily"
                  className="flex-1 sm:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="flex-1 sm:flex-none text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Weekly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Routines Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {routines.map((routine) => (
              <Card
                key={routine._id}
                className="border-gray-200 shadow-sm flex flex-col h-[400px]"
              >
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-medium">
                    {routine.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/routines/${routine._id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(routine._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 p-4">
                  <p className="text-sm text-gray-500">{routine.description}</p>

                  <div className="flex justify-between text-gray-500 text-sm mt-4">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" />
                      {routine.days.join(", ")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {routine.startTime} - {routine.endTime}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4">
                    {routine.tasks && routine.tasks.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tasks</span>
                          <span className="text-xs text-gray-500">
                            {
                              routine.tasks.filter((task) => task.completed)
                                .length
                            }
                            /{routine.tasks.length} completed
                          </span>
                        </div>
                        <div className="space-y-2">
                          {routine.tasks.map((task) => (
                            <div
                              key={task._id}
                              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    task.priority === "high"
                                      ? "bg-red-500"
                                      : task.priority === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                  }`}
                                />
                                <span className="text-sm">{task.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {task.duration} min
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                        <ListTodo className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          No tasks added yet
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() =>
                        router.push(`/dashboard/routines/${routine._id}`)
                      }
                    >
                      <ListTodo className="h-4 w-4 mr-2" />
                      Manage Tasks
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
