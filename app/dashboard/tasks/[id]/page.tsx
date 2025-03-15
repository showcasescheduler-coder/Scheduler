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
  AlertCircle,
  Clock,
  CheckCircle2,
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
import MobileNav from "@/app/components/MobileNav";
import { UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";

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
  status?: string;
  type?: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  timeWindow?: {
    start?: string;
    end?: string;
  };
  isCustomDuration?: boolean;
}

export default function TaskDetails({ params: { id } }: Props) {
  const { tasks, updateTask } = useAppContext();
  const [task, setTask] = useState<Task | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    name: "",
    timeWindow: "",
    deadline: "",
  });

  const getTypeStyles = (type: string) => {
    const styles = {
      "deep-work": "text-purple-800 bg-purple-100",
      planning: "text-blue-800 bg-blue-100",
      break: "text-green-800 bg-green-100",
      admin: "text-gray-800 bg-gray-100",
      collaboration: "text-orange-800 bg-orange-100",
    };
    return styles[type as keyof typeof styles] || styles.admin;
  };

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

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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

    // Clear deadline error when user changes date
    if (formErrors.deadline) {
      setFormErrors((prev) => ({
        ...prev,
        deadline: "",
      }));
    }
  };

  const handleTimeWindowChange = (field: "start" | "end", value: string) => {
    setTask((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        timeWindow: {
          ...prev.timeWindow,
          [field]: value,
        },
      };
    });

    // Clear time window error when user changes time
    if (formErrors.timeWindow) {
      setFormErrors((prev) => ({
        ...prev,
        timeWindow: "",
      }));
    }
  };

  const handleSave = async () => {
    if (!task) return;

    // Reset errors
    setFormErrors({
      name: "",
      timeWindow: "",
      deadline: "",
    });

    // Validate form
    let isValid = true;
    const newErrors = {
      name: "",
      timeWindow: "",
      deadline: "",
    };

    // Name is required
    if (!task.name.trim()) {
      newErrors.name = "Task name is required";
      isValid = false;
    }

    // Time window validation: start must be before end if both are provided
    if (task.timeWindow?.start && task.timeWindow?.end) {
      if (task.timeWindow.start >= task.timeWindow.end) {
        newErrors.timeWindow = "Start time must be before end time";
        isValid = false;
      }
    }

    // Deadline validation: date cannot be in the past
    if (task.deadline) {
      const selectedDate = new Date(task.deadline);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
        isValid = false;
      }
    }

    // If validation fails, show errors and return
    if (!isValid) {
      setFormErrors(newErrors);
      return;
    }

    // Continue with save if validation passes
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
      toast.success("Task updated successfully!");
      router.push("/dashboard/tasks"); // Navigate to tasks dashboard after successful save
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  if (loading || !task) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
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

              <div className="text-sm font-medium">
                {format(new Date(), "MMM d, yyyy")}
              </div>

              <UserButton />
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2 shrink-0"
                onClick={() => router.push("/dashboard/tasks")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold truncate">
                    {task?.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                      {task?.status || "Todo"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due{" "}
                      {task?.deadline
                        ? format(new Date(task.deadline), "MMM dd, yyyy")
                        : "Not set"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="ml-4 shrink-0"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:block border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard/tasks")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      Task Details
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Task Name and Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-blue-500" />
                        Task Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={task?.name}
                        onChange={handleInputChange}
                        className={`mt-2 ${
                          formErrors.name ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        Description
                      </label>
                      <Textarea
                        name="description"
                        value={task?.description}
                        onChange={handleInputChange}
                        className="mt-2 min-h-[320px]"
                      />
                    </div>
                  </div>

                  {/* Right Column - Other Fields */}
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Due Date
                        </label>
                        <div className="mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  formErrors.deadline ? "border-red-500" : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>
                                  {task?.deadline
                                    ? format(
                                        new Date(task.deadline),
                                        "MMMM dd, yyyy"
                                      )
                                    : "Select date"}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={
                                  task?.deadline
                                    ? new Date(task.deadline)
                                    : undefined
                                }
                                onSelect={handleDateChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.deadline && (
                            <p className="text-sm text-red-500 mt-1">
                              {formErrors.deadline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Duration
                        </label>
                        <div className="mt-2 space-y-2">
                          <Select
                            value={
                              task?.isCustomDuration
                                ? "custom"
                                : task?.duration?.toString() || "0"
                            }
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setTask((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        duration: 0,
                                        isCustomDuration: true,
                                      }
                                    : null
                                );
                              } else {
                                setTask((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        duration: parseInt(value),
                                        isCustomDuration: false,
                                      }
                                    : null
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">
                                Can be done in parallel
                              </SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                              <SelectItem value="custom">
                                Custom duration...
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {task?.isCustomDuration && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="480"
                                value={task.duration || ""}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (
                                    !isNaN(value) &&
                                    value >= 0 &&
                                    value <= 480
                                  ) {
                                    setTask((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            duration: value,
                                          }
                                        : null
                                    );
                                  }
                                }}
                                className="flex-1"
                                placeholder="Enter duration in minutes"
                              />
                              <span className="text-sm text-gray-500 w-16">
                                minutes
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Time Window
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={task?.timeWindow?.start || ""}
                              onChange={(e) =>
                                handleTimeWindowChange("start", e.target.value)
                              }
                              className={`mt-1 ${
                                formErrors.timeWindow ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={task?.timeWindow?.end || ""}
                              onChange={(e) =>
                                handleTimeWindowChange("end", e.target.value)
                              }
                              className={`mt-1 ${
                                formErrors.timeWindow ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 mt-1">
                            Optional: Set a time window for when this task needs
                            to be completed
                          </p>
                          {formErrors.timeWindow && (
                            <p className="text-sm text-red-500 mt-1">
                              {formErrors.timeWindow}
                            </p>
                          )}
                        </div>
                      </div>
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
