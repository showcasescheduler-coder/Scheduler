"use client";
import React, { useState, useEffect } from "react";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Routine, Task } from "@/app/context/models";
import { useAppContext } from "@/app/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";

type NewRoutineForm = Omit<Routine, "id" | "tasks">;

const RoutinePage = () => {
  const { setRoutines, routines, addRoutine } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const router = useRouter();
  const [newRoutine, setNewRoutine] = useState<NewRoutineForm>({
    _id: "",
    name: "",
    description: "",
    days: [],
    block: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchRoutines = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/routines?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch routines");
        }
        const data = await response.json();
        setRoutines(data);
      } catch (error) {
        console.error("Error fetching routines:", error);
        alert("Failed to fetch routines. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutines();
  }, [userId, setRoutines]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    console.log("Creating routine:", newRoutine);
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newRoutine, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create routine");
      }

      const createdRoutine = await response.json();
      addRoutine(createdRoutine);
      setIsDialogOpen(false);
      setNewRoutine({
        _id: "",
        name: "",
        description: "",
        days: [],
        block: "",
        startTime: "",
        endTime: "",
      });
      alert("Routine created successfully!");
    } catch (error) {
      console.error("Error creating routine:", error);
      alert("Failed to create routine. Please try again.");
    }
  };

  const handleEdit = (routineId: string) => {
    router.push(`/dashboard/routines/${routineId}`);
  };

  const handleDelete = async (routineId: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;

    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete routine");
      }

      setRoutines((prevRoutines) =>
        prevRoutines.filter((routine) => routine._id !== routineId)
      );
      alert("Routine deleted successfully!");
    } catch (error) {
      console.error("Error deleting routine:", error);
      alert("Failed to delete routine. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading routines...</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Routine
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((routine) => (
          <Card key={routine._id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>{routine.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(routine._id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(routine._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm text-gray-600">
                  {routine.days.join(", ")}
                </span>
              </div>
              {routine.tasks && routine.tasks.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ul className="space-y-2">
                    {routine.tasks.map((task: Task) => (
                      <li key={task._id} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>{task.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tasks added yet.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleEdit(routine._id)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default RoutinePage;
