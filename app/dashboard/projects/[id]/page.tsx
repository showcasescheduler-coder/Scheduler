"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Project, ProjectTask, Task } from "@/app/context/models";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  params: { id: string };
}

const ProjectDetailsPage = ({ params: { id } }: Props) => {
  const { projects, updateProject, addTaskToProject, setProjects } =
    useAppContext();
  const [project, setProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  useEffect(() => {
    const foundProject = projects.find((p) => p._id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [id, projects]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProject((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleDateChange = (date: Date | null | undefined) => {
    setProject((prev) => {
      if (!prev) return null;
      return { ...prev, deadline: date ? date : prev.deadline };
    });
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject = await response.json();

      // Update the project in the global state
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p._id === id ? updatedProject : p))
      );

      alert("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const task = {
    _id: Date.now().toString(),
    name: newTask.name,
    description: newTask.description,
    priority: newTask.priority,
    duration: newTask.duration,
    deadline: newTask.deadline,
    projectId: project?._id,
    status: "Todo" as const,
    block: null,
  } as ProjectTask;

  // const handleAddTask = async () => {
  //   fetch("/api/tasks").then;

  //   // if (project && newTask.name) {
  //   //   try {
  //   //     const response = await fetch("/api/tasks", {
  //   //       method: "POST",
  //   //       headers: {
  //   //         "Content-Type": "application/json",
  //   //       },
  //   //       body: JSON.stringify({
  //   //         name: newTask.name,
  //   //         description: newTask.description || "",
  //   //         priority: newTask.priority || "Medium", // Changed this line
  //   //         duration: newTask.duration || "",
  //   //         deadline: newTask.deadline || new Date(),
  //   //         projectId: project._id,
  //   //         status: "todo",
  //   //       }),
  //   //     });
  //   //     if (!response.ok) {
  //   //       throw new Error("Failed to create task");
  //   //     }
  //   //     const createdTask = await response.json();
  //   //     // Update the local state
  //   //     setProject((prevProject) => {
  //   //       if (!prevProject) return null;
  //   //       return {
  //   //         ...prevProject,
  //   //         tasks: [...prevProject.tasks, createdTask],
  //   //       };
  //   //     });
  //   //     // Update the global state
  //   //     setProjects((prevProjects) =>
  //   //       prevProjects.map((p) =>
  //   //         p._id === project._id
  //   //           ? { ...p, tasks: [...p.tasks, createdTask] }
  //   //           : p
  //   //       )
  //   //     );
  //   //     setNewTask({});
  //   //     setIsTaskDialogOpen(false);
  //   //   } catch (error) {
  //   //     console.error("Error adding task:", error);
  //   //     alert("Failed to add task. Please try again.");
  //   //   }
  //   // }
  // };

  const handleAddTask = async () => {
    if (project && newTask.name) {
      try {
        const taskData = {
          name: newTask.name,
          description: newTask.description || "",
          priority: newTask.priority || "Medium",
          duration: newTask.duration || "",
          deadline: newTask.deadline || new Date(),
          projectId: project._id,
          status: "Todo",
        };
        console.log("Sending task data:", taskData);

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Server response:", result);

        // Update local state
        setProject((prevProject) => {
          if (!prevProject) return null;
          return {
            ...prevProject,
            tasks: [...prevProject.tasks, result.task],
          };
        });

        // Update global state
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p._id === project._id
              ? { ...p, tasks: [...p.tasks, result.task] }
              : p
          )
        );

        // Clear the form and close the dialog
        setNewTask({});
        setIsTaskDialogOpen(false);
      } catch (error) {
        console.error("Error sending task data:", error);
        alert(
          `Failed to send task data. ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };
  if (!project) return <div>Loading...</div>;

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {project.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            In stock
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Project
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Update the details of your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={project.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={project.description}
                      onChange={handleInputChange}
                      className="min-h-32"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="deadline">Project Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !project.deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {project.deadline ? (
                            format(new Date(project.deadline), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            project.deadline
                              ? new Date(project.deadline)
                              : undefined
                          }
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Manage tasks associated with this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.duration}</TableCell>
                        <TableCell>{task.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-center border-t p-4">
                <Dialog
                  open={isTaskDialogOpen}
                  onOpenChange={setIsTaskDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="task-name"
                          value={newTask.name || ""}
                          onChange={(e) =>
                            setNewTask({ ...newTask, name: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="task-description"
                          className="text-right"
                        >
                          Description
                        </Label>
                        <Input
                          id="task-description"
                          value={newTask.description || ""}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              description: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-duration" className="text-right">
                          Duration
                        </Label>
                        <Input
                          id="task-duration"
                          value={newTask.duration || ""}
                          onChange={(e) =>
                            setNewTask({ ...newTask, duration: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-priority" className="text-right">
                          Priority
                        </Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) =>
                            setNewTask({ ...newTask, priority: value })
                          }
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
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Project
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ProjectDetailsPage;
