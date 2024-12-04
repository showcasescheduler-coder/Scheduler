"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SidebarContent } from "@/app/components/SideBar";
import { useAppContext } from "@/app/context/AppContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage() {
  const { projects, setProjects, addProject } = useAppContext();
  const router = useRouter();
  const { userId } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
    time: "",
    priority: "Medium",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/projects?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [userId, setProjects]);

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setNewProject((prev) => ({ ...prev, priority: value }));
  };

  const handleAddProject = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProject, userId }),
      });
      if (!response.ok) throw new Error("Failed to create project");
      const data = await response.json();
      addProject(data.project);
      setNewProject({
        name: "",
        description: "",
        deadline: "",
        time: "",
        priority: "Medium",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const EmptyProjectsDisplay = () => (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first project!
        </p>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Project
        </Button>
      </div>
    </div>
  );

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
                <h1 className="text-2xl font-semibold">Projects</h1>
                <p className="text-sm text-gray-500">
                  Manage your ongoing projects
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new project.
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
                        value={newProject.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newProject.description}
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
                        value={newProject.deadline}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">
                        Time
                      </Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={newProject.time}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select
                        onValueChange={handlePriorityChange}
                        defaultValue={newProject.priority}
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
                    <Button onClick={handleAddProject}>Add Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full mb-6">
            <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1 w-full sm:w-auto">
              <TabsTrigger
                value="active"
                className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {projects.length === 0 ? (
            <EmptyProjectsDisplay />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Card key={project._id} className="border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {project.name}
                    </CardTitle>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {project.priority}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-500">
                      {project.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{30}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${30}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {project.time}
                        </div>
                        <span>
                          {40}/{100} tasks
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleViewDetails(project._id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
