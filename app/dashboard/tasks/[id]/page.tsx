"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Menu,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  CheckCircle,
  CalendarIcon,
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
import { SidebarContent } from "@/app/components/SideBar";
import { useAppContext } from "@/app/context/AppContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Props {
  params: { id: string };
}
interface Task {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  duration: number;
  deadline: string;
  completed: boolean;
  status?: string; // Make status optional
  type?: "deep-work" | "planning" | "break" | "admin" | "collaboration"; // Make
}

export default function TaskDetails({ params: { id } }: Props) {
  const { tasks, updateTask } = useAppContext();
  const [task, setTask] = useState<Task | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task details");
        }
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error("Error fetching task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTask((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleDateChange = (date: Date | null | undefined) => {
    setTask((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        deadline: date ? format(date, "yyyy-MM-dd") : prev.deadline,
      };
    });
  };

  const handleSave = async () => {
    if (task) {
      try {
        const response = await fetch(`/api/tasks/stand-alone-tasks`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const { task: updatedTask } = await response.json();
        updateTask(id, updatedTask);
        alert("Task updated successfully!");
        router.push("/dashboard/tasks"); // Navigate to tasks dashboard after successful save
      } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task. Please try again.");
      }
    }
  };

  if (loading || !task) return <div>Loading...</div>;

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
                {/* Mobile Menu */}
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
                  onClick={() => router.push("/dashboard/tasks")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      {task.name}
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Task Details */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      name="name" // A
                      defaultValue="Have lunch with mum"
                      className="mt-2"
                      value={task.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      name="description" // Added name attribute
                      defaultValue="Meet mum at the coffee shop"
                      className="mt-2"
                      value={task.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !task.deadline && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {task.deadline ? (
                                format(new Date(task.deadline), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={
                                task.deadline
                                  ? new Date(task.deadline)
                                  : undefined
                              }
                              onSelect={handleDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <Input
                        name="duration"
                        value={task.duration}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        defaultValue="upcoming"
                        value={task.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        defaultValue="medium"
                        value={task.priority}
                        onValueChange={(value) =>
                          handleSelectChange("priority", value)
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
