"use client";
import React, { use, useEffect, useState, useMemo } from "react";
import { File, ListFilter, MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Task } from "@/app/context/models";
import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { set } from "mongoose";
import { useAuth } from "@clerk/nextjs";
type NewTaskForm = Omit<Task, "id" | "status">;
import { useRouter } from "next/navigation";

const Page = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const { tasks, addTask, setTasks } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    _id: "",
    name: "",
    description: "",
    priority: "Medium", // Set a default value
    duration: 5,
    deadline: "",
    completed: false,
    block: null,
    routine: null,
    isRoutineTask: false,
    project: null,
    projectId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/tasks?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
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

  // To add a new task
  const handleAddTask = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/tasks/stand-alone-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();

      // Add the new task to the local state
      addTask(createdTask.task);

      setIsDialogOpen(false); // Close the dialog after adding
      setNewTask({
        _id: "",
        name: "",
        description: "",
        priority: "Medium", // Set a default value
        duration: 5,
        deadline: "",
        completed: false,
        block: null,
        routine: null,
        isRoutineTask: false,
        project: null,
        projectId: null,
      });

      alert("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
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

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      const deletedTask = await response.json();

      // Remove the deleted task from the local state
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      setIsDialogOpen(false); // Close the dialog after deleting
      setNewTask({
        _id: "",
        name: "",
        description: "",
        priority: "Medium",
        duration: 5,
        deadline: "",
        completed: false,
        block: null,
        routine: null,
        isRoutineTask: false,
        project: null,
        projectId: null,
      });

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
        !task.projectId && !task.isRoutineTask && task.completed !== true
    );
  }, [tasks]);

  console.log("All tasks:", tasks);

  console.log("Standalone tasks:", standaloneTasks);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-lg text-center">Loading...</p>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Active</TabsTrigger>
            <TabsTrigger value="active">Completed</TabsTrigger>
            {/* <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger> */}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button> */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Task
                  </span>
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
                      value={newTask.name || ""}
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
                      value={newTask.description || ""}
                      onChange={handleInputChange}
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
                      value={newTask.deadline || ""}
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
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Stand Alone Tasks</CardTitle>
              <CardDescription>Manage your standalone tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Priority
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Duration
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standaloneTasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/tasks/${task._id}`}>
                          {task.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {task.description}
                      </TableCell>
                      <TableCell>
                        {task.deadline &&
                          format(parseISO(task.deadline), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {task.priority}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {task.duration}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(task._id)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task._id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{tasks.length}</strong> of{" "}
                <strong>{tasks.length}</strong> tasks
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;
