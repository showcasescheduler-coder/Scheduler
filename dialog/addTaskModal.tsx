"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, CheckCircle } from "lucide-react";
import { Task, Project, Block } from "@/app/context/models";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { Label } from "@/components/ui/label";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  blockId: string | null;
  updateDay: () => void; // New prop to update the day state
}

const projectsData = [
  {
    id: "1",
    name: "Website Redesign",
    tasks: [
      {
        id: "A1",
        name: "Design homepage mockup",
        description: "Create a new design for the homepage",
        priority: "High",
      },
      {
        id: "A2",
        name: "Implement responsive layout",
        description: "Ensure the website is mobile-friendly",
        priority: "Medium",
      },
      {
        id: "A3",
        name: "Optimize images",
        description: "Compress and optimize all images for web",
        priority: "Low",
      },
      // ... more tasks
    ],
  },
  {
    id: "2",
    name: "Mobile App Development",
    tasks: [
      {
        id: "B1",
        name: "Design user interface",
        description: "Create UI designs for the mobile app",
        priority: "High",
      },
      {
        id: "B2",
        name: "Develop login functionality",
        description: "Implement user authentication",
        priority: "High",
      },
      {
        id: "B3",
        name: "Create settings page",
        description: "Develop the app settings page",
        priority: "Medium",
      },
      // ... more tasks
    ],
  },
];

const existingTasks = [
  {
    id: "E1",
    name: "Update documentation",
    description: "Review and update project documentation",
    priority: "Medium",
  },
  {
    id: "E2",
    name: "Client meeting preparation",
    description: "Prepare slides for the upcoming client meeting",
    priority: "High",
  },
  {
    id: "E3",
    name: "Bug fixing",
    description: "Address reported bugs in the latest release",
    priority: "High",
  },
  // ... more tasks
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  blockId,
  updateDay,
}) => {
  const [selectedProject, setSelectedProject] = useState(projectsData[0].id);
  const [activeTab, setActiveTab] = useState<string>("newTask");
  const { tasks, projects, setProjects, setTasks, setBlocks } = useAppContext();
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    priority: "",
    duration: 5, // Default duration of 5 minutes
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      console.log("tasks", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      const projectsArray = data.projects || [];
      setProjects(projectsArray);
      if (projectsArray.length > 0) {
        setSelectedProject(projectsArray[0]._id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "existingTask") {
      fetchTasks();
    }
    if (activeTab === "projectTask") {
      console.log("fetching projects");
      fetchProjects();
    }
  }, [activeTab]);

  const addTaskToBlock = async (taskId: string) => {
    try {
      const res = await fetch(`/api/blocks/${blockId}`, {
        method: "POST",
        body: JSON.stringify({ taskId: taskId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to add task to block");
      }
      const data = await res.json();
      // Assuming the API returns the updated block and task
      const { updatedBlock, updatedTask } = data;
      console.log("task added to block", data);

      // Update projects state
      setProjects((prevProjects: Project[]) =>
        prevProjects.map((project) => ({
          ...project,
          tasks: project.tasks.map((task) =>
            task._id === taskId ? { ...task, block: blockId } : task
          ),
        }))
      );

      // Update tasks state
      setTasks((prevTasks: Task[]) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );

      updateDay();
    } catch (error) {
      console.error("Error adding task to block:", error);
    }
  };

  const handleNewTaskSubmit = async () => {
    console.log("Creating new task:");
    try {
      const taskData = {
        ...newTask,
        blockId: blockId,
        duration: Math.max(5, Math.min(240, newTask.duration)), // Ensure duration is between 5 and 240 minutes
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const data = await response.json();
      console.log("New task created:", data.task);

      // Update local state
      setTasks((prevTasks) => [...prevTasks, data.task]);

      // Clear the form
      setNewTask({ name: "", description: "", priority: "", duration: 5 });

      // Close the modal
      onClose();

      // Update the day view
      updateDay();
    } catch (error) {
      console.error("Error creating new task:", error);
    }
  };

  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task to Block</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="newTask"
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="newTask">New Task</TabsTrigger>
            <TabsTrigger value="existingTask">Task Bank</TabsTrigger>
            <TabsTrigger value="projectTask">Project Task</TabsTrigger>
          </TabsList>
          <TabsContent value="newTask">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="task-name"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-duration">Duration (minutes)</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min="5"
                  max="240"
                  value={newTask.duration}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      duration: Math.max(
                        5,
                        Math.min(240, Number(e.target.value))
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger>
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
          </TabsContent>
          <TabsContent value="existingTask">
            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="p-4 space-y-4">
                {tasks.map((task) => (
                  <Card
                    key={task._id}
                    className={task.block ? "opacity-50" : ""}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{task.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              task.priority.toLowerCase() as
                                | "default"
                                | "secondary"
                                | "destructive"
                            }
                          >
                            {task.priority}
                          </Badge>
                          {task.block && (
                            <Badge variant="outline">Assigned</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => addTaskToBlock(task._id)}
                        disabled={!!task.block}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {task.block ? "Assigned" : "Add"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            {/* <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4 space-y-4">
                {tasks.map((task) => (
                  <Card key={task._id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{task.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {task.description}
                        </p>
                        <Badge
                          variant={
                            task.priority.toLowerCase() as
                              | "default"
                              | "secondary"
                              | "destructive"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea> */}
          </TabsContent>
          <TabsContent value="projectTask">
            <div className="space-y-4">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project">
                    {projects.find((p) => p._id === selectedProject)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ScrollArea className="h-72 w-100 rounded-md border">
                <div className="p-4 space-y-4">
                  {projects
                    .find((p) => p._id === selectedProject)
                    ?.tasks.map((task) => (
                      <Card
                        key={task._id}
                        className={task.block ? "opacity-50" : ""}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">{task.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {task.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  task.priority.toLowerCase() as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                }
                              >
                                {task.priority}
                              </Badge>
                              {task.block && (
                                <Badge variant="outline">Assigned</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => addTaskToBlock(task._id)}
                            disabled={!!task.block}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            {task.block ? "Assigned" : "Add"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleNewTaskSubmit}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
