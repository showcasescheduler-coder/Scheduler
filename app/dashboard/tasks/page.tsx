"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  Repeat,
  BarChart2,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Menu,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarContent } from "@/app/components/SideBar";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserButton } from "@clerk/nextjs";
import MobileNav from "@/app/components/MobileNav";

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
}

export default function StandaloneTasks() {
  const { userId } = useAuth();
  const router = useRouter();
  const { tasks, addTask, setTasks } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState<Task>({
    _id: "",
    name: "",
    description: "",
    priority: "Medium",
    duration: 5,
    deadline: "",
    completed: false,
    type: "deep-work",
    timeWindow: {
      start: "",
      end: "",
    },
  });
  const [activeTab, setActiveTab] = useState("active");

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/tasks?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Failed to fetch tasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userId, setTasks]);

  const handlePriorityChange = (value: string) => {
    setNewTask((prev) => ({ ...prev, priority: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async () => {
    if (!userId) return;
    console.log("this is the new task im sending 0", newTask);
    try {
      const response = await fetch("/api/tasks/stand-alone-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, userId }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const createdTask = await response.json();
      addTask(createdTask.task);
      setIsDialogOpen(false);
      setNewTask({
        _id: "",
        name: "",
        description: "",
        priority: "Medium",
        duration: 5,
        deadline: "",
        completed: false,
        type: "deep-work", // Reset to default type
      });
      alert("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleTypeChange = (value: string) => {
    console.log("Type selected:", value); // Add this for debugging
    setNewTask((prev) => {
      const updatedTask = {
        ...prev,
        type: value as Task["type"],
      };
      console.log("Updated task:", updatedTask); // Add this for debugging
      return updatedTask;
    });
  };

  const handleDelete = async (taskId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(
        `/api/tasks/stand-alone-tasks?id=${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleEdit = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  const standaloneTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        !task.projectId &&
        !task.isRoutineTask &&
        task.completed === (activeTab === "completed")
    );
  }, [tasks, activeTab]);

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      High: "text-red-800 bg-red-100",
      Medium: "text-yellow-800 bg-yellow-100",
      Low: "text-green-800 bg-green-100",
    };
    return colors[priority] || colors.Medium; // Provide a default value
  };

  const getTypeColor = (type: Task["type"]): string => {
    const colors: Record<string, string> = {
      "deep-work": "text-purple-800 bg-purple-100",
      planning: "text-blue-800 bg-blue-100",
      break: "text-green-800 bg-green-100",
      admin: "text-gray-800 bg-gray-100",
      collaboration: "text-orange-800 bg-orange-100",
    };
    return type ? colors[type] : colors["admin"];
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-lg text-center">Loading...</p>
      </main>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  console.log(tasks);

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Tasks</h1>
              <p className="text-sm text-gray-500">
                Manage your standalone tasks
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Task</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new standalone task.
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
                      value={newTask.name}
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
                      value={newTask.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeWindow.start" className="text-right">
                      Time Window Start
                    </Label>
                    <Input
                      id="timeWindow.start"
                      name="timeWindow.start"
                      type="time"
                      value={newTask.timeWindow?.start || ""}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          timeWindow: {
                            ...prev.timeWindow,
                            start: e.target.value,
                          },
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeWindow.end" className="text-right">
                      Time Window End
                    </Label>
                    <Input
                      id="timeWindow.end"
                      name="timeWindow.end"
                      type="time"
                      value={newTask.timeWindow?.end || ""}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          timeWindow: {
                            ...prev.timeWindow,
                            end: e.target.value,
                          },
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deadline" className="text-right">
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={newTask.deadline}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={handlePriorityChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="5"
                      max="240"
                      value={newTask.duration}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Task Type
                    </Label>
                    <Select
                      value={newTask.type || "deep-work"} // Provide a default value
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deep-work">Deep Work</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="collaboration">
                          Collaboration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddTask}
                  >
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="active"
                  className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Active (
                  {
                    tasks.filter(
                      (task) =>
                        !task.projectId &&
                        !task.isRoutineTask &&
                        !task.completed
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Completed (
                  {
                    tasks.filter(
                      (task) =>
                        !task.projectId && !task.isRoutineTask && task.completed
                    ).length
                  }
                  )
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Task List - Desktop */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Task</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standaloneTasks.map((task) => (
                    <TableRow key={task._id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {task.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <span>{task.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.description}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.deadline &&
                          format(parseISO(task.deadline), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.duration}m
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            task.type
                          )}`}
                        >
                          {task.type
                            ? task.type
                                .replace("-", " ")
                                .charAt(0)
                                .toUpperCase() + task.type.slice(1)
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(task._id)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task._id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Mark as Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Card className="md:hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Task</TableHead>
                    <TableHead className="w-[80px]">Priority</TableHead>
                    <TableHead className="w-[80px]">Due</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standaloneTasks.map((task) => (
                    <TableRow key={task._id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {task.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm">{task.name}</span>
                            <span className="text-xs text-gray-500">
                              {task.duration}m
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {task.deadline &&
                          new Date(task.deadline).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(task._id)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task._id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Mark as Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Empty State stays the same */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="rounded-full bg-gray-50 p-4 w-12 h-12 mx-auto mb-4">
                <ListTodo className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No tasks
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by creating a new task
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
