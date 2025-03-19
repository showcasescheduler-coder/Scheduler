"use client";

import React, { useState, useEffect } from "react";
import { Plus, Menu, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { format } from "date-fns";
import { UserButton } from "@clerk/nextjs";
import MobileNav from "@/app/components/MobileNav";

// ^ or define your empty placeholder in a separate file
import SortableProjectItem from "@/app/components/SortableProjectItem";

// DnD Kit Imports
import {
  DndContext,
  DragStartEvent, // NEW
  DragEndEvent,
  DragOverlay, // NEW
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Event,
  Project,
  ProjectTask,
  Task,
  Routine,
  RoutineTask,
  UserData,
  Day,
  Block,
  PreviewSchedule, // Impo
} from "@/app/context/models";

export default function ProjectsPage() {
  const { projects, setProjects, addProject } = useAppContext();
  const router = useRouter();
  const { userId } = useAuth();

  // NEW OR UPDATED: track the currently active draggable item
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
    time: "",
  });
  const [activeTab, setActiveTab] = useState("active");
  const [formErrors, setFormErrors] = useState({
    name: "",
    deadline: "",
    description: "", // Add description to track its error state
  });

  // DnDKit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch projects on mount
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

  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user types in a field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePriorityChange = (value: string) => {
    setNewProject((prev) => ({ ...prev, priority: value }));
  };

  const handleAddProject = async () => {
    if (!userId) return;

    // Reset previous errors
    setFormErrors({
      name: "",
      deadline: "",
      description: "", // Clear description errors too
    });

    // Validate name
    let isValid = true;
    const newErrors = {
      name: "",
      deadline: "",
      description: "", // Include description in errors object
    };

    if (!newProject.name.trim()) {
      newErrors.name = "Project name is required";
      isValid = false;
    }

    // Add description validation
    if (!newProject.description.trim()) {
      newErrors.description = "Project description is required";
      isValid = false;
    }

    // Validate deadline is required and not in the past
    if (!newProject.deadline) {
      newErrors.deadline = "Deadline is required";
      isValid = false;
    } else {
      const selectedDate = new Date(newProject.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
        isValid = false;
      }
    }

    // If validation fails, update error state and return
    if (!isValid) {
      setFormErrors(newErrors);
      return;
    }

    // If validation passes, submit the form
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
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  // Separate active vs completed
  const activeProjects = projects
    .filter((p) => !p.completed)
    .sort((a, b) => a.order - b.order);
  const completedProjects = projects.filter((p) => p.completed);

  // NEW: handle drag start — set the activeId
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id?.toString() || null);
  };

  // DRAG END: Reorder locally and call API
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    try {
      // 1. Create optimistic update
      const oldIndex = activeProjects.findIndex(
        (item) => item._id === active.id
      );
      const newIndex = activeProjects.findIndex((item) => item._id === over.id);

      const newActiveArray = arrayMove(activeProjects, oldIndex, newIndex);
      const updatedActiveArray = newActiveArray.map((proj, idx) => ({
        ...proj,
        order: idx,
      }));

      // 2. Update state optimistically
      setProjects((prev) => {
        const completedProjects = prev.filter((p) => p.completed);
        return [...updatedActiveArray, ...completedProjects];
      });

      // 3. Make API call
      const payload = {
        projects: updatedActiveArray.map((p) => ({
          _id: p._id,
          order: p.order,
        })),
      };

      const response = await fetch("/api/reorder-projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder projects");
      }
    } catch (error) {
      // 4. Revert on error
      console.error("Error reordering:", error);
      setProjects((prev) => [...prev]); // Revert to previous state
    }
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

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {/* Left: Menu button */}
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

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-semibold">Projects</h1>
                <p className="text-sm text-gray-500">
                  Manage your ongoing projects
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] w-[95vw] max-w-md mx-auto p-4 md:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Add New Project
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Enter the details for the new project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                      <Label
                        htmlFor="name"
                        className="md:text-right text-gray-600"
                      >
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="md:col-span-3">
                        <Input
                          id="name"
                          name="name"
                          value={newProject.name}
                          onChange={handleInputChange}
                          className={`border-gray-200 focus:ring-blue-600 focus:border-blue-600 ${
                            formErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                      <Label
                        htmlFor="description"
                        className="md:text-right text-gray-600 pt-0 md:pt-2"
                      >
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <div className="md:col-span-3">
                        <Textarea
                          id="description"
                          name="description"
                          value={newProject.description}
                          onChange={handleInputChange}
                          className={`border-gray-200 focus:ring-blue-600 focus:border-blue-600 min-h-[80px] md:min-h-[100px] ${
                            formErrors.description ? "border-red-500" : ""
                          }`}
                          placeholder="Enter project description..."
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                      <Label
                        htmlFor="deadline"
                        className="md:text-right text-gray-600"
                      >
                        Deadline <span className="text-red-500">*</span>
                      </Label>
                      <div className="md:col-span-3">
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          value={newProject.deadline}
                          onChange={handleInputChange}
                          className={`border-gray-200 focus:ring-blue-600 focus:border-blue-600 ${
                            formErrors.deadline ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.deadline && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.deadline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex sm:justify-end mt-2">
                    <Button
                      onClick={handleAddProject}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                      Add Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-4 md:mb-6"
          >
            <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1 w-full md:w-auto">
              <TabsTrigger
                value="active"
                className="flex-1 text-sm px-4 md:px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 text-sm px-4 md:px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Completed
              </TabsTrigger>
            </TabsList>

            {/* ------------------- ACTIVE PROJECTS --------------------- */}
            <TabsContent value="active" className="mt-4 md:mt-6">
              {activeProjects.length === 0 ? (
                <EmptyProjectsDisplay />
              ) : (
                <>
                  <h2 className="text-xs md:text-sm font-semibold text-gray-500 mb-2 md:mb-3">
                    Priority Order (Drag to reorder)
                  </h2>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveId(null)}
                  >
                    <SortableContext
                      items={activeProjects.map((p) => p._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {activeProjects.map((project, index) => (
                        <SortableProjectItem
                          key={project._id}
                          project={project}
                          index={index}
                          onViewDetails={handleViewDetails}
                          isOverlay={false}
                        />
                      ))}
                    </SortableContext>

                    <DragOverlay>
                      {activeId ? (
                        <SortableProjectItem
                          project={
                            activeProjects.find((p) => p._id === activeId)!
                          }
                          index={0}
                          onViewDetails={handleViewDetails}
                          isOverlay={true}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </>
              )}
            </TabsContent>

            {/* ------------------- COMPLETED PROJECTS --------------------- */}
            <TabsContent value="completed" className="mt-4 md:mt-6">
              {completedProjects.length === 0 ? (
                <EmptyProjectsDisplay />
              ) : (
                <>
                  {/* Desktop View for Completed Projects */}
                  <div className="hidden sm:block">
                    {completedProjects.map((project, index) => (
                      <div
                        key={project._id}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-3"
                      >
                        <div className="flex items-center gap-4 p-6">
                          <div className="flex items-center gap-4 w-full">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-semibold text-gray-900">
                                {project.name}
                              </h3>
                              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {project.deadline
                                      ? format(
                                          new Date(project.deadline),
                                          "MMM d, yyyy"
                                        )
                                      : "No deadline"}
                                  </span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span>
                                  {project.tasks
                                    ? `${
                                        project.tasks.filter(
                                          (task) => task.completed
                                        ).length
                                      }/${project.tasks.length} tasks`
                                    : "0/0 tasks"}
                                </span>
                              </div>
                            </div>

                            {/* Desktop Progress bar */}
                            <div className="mx-auto w-80">
                              <div className="mb-1 flex justify-between text-xs">
                                <span className="font-medium text-gray-700">
                                  {project.tasks && project.tasks.length > 0
                                    ? Math.round(
                                        (project.tasks.filter(
                                          (task) => task.completed
                                        ).length /
                                          project.tasks.length) *
                                          100
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      project.tasks && project.tasks.length > 0
                                        ? Math.round(
                                            (project.tasks.filter(
                                              (task) => task.completed
                                            ).length /
                                              project.tasks.length) *
                                              100
                                          )
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                    >
                                      <Info className="h-4 w-4" />
                                      <span className="sr-only">
                                        Project Info
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    align="center"
                                    className="max-w-xs p-3"
                                  >
                                    <p className="text-sm">
                                      {project.description ||
                                        "No description provided"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(project._id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile View for Completed Projects */}
                  <div className="sm:hidden">
                    {completedProjects.map((project, index) => (
                      <div
                        key={project._id}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-3"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 pr-2">
                              {project.name}
                            </h3>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-900 flex-shrink-0"
                                  >
                                    <Info className="h-4 w-4" />
                                    <span className="sr-only">
                                      Project Info
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="left"
                                  align="center"
                                  className="max-w-xs p-3"
                                >
                                  <p className="text-sm">
                                    {project.description ||
                                      "No description provided"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {project.deadline
                                  ? format(
                                      new Date(project.deadline),
                                      "MMM d, yyyy"
                                    )
                                  : "No deadline"}
                              </span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span>
                              {project.tasks
                                ? `${
                                    project.tasks.filter(
                                      (task) => task.completed
                                    ).length
                                  }/${project.tasks.length} tasks`
                                : "0/0 tasks"}
                            </span>
                          </div>

                          {/* Mobile Progress bar */}
                          <div className="mb-3">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="font-medium text-gray-700">
                                {project.tasks && project.tasks.length > 0
                                  ? Math.round(
                                      (project.tasks.filter(
                                        (task) => task.completed
                                      ).length /
                                        project.tasks.length) *
                                        100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{
                                  width: `${
                                    project.tasks && project.tasks.length > 0
                                      ? Math.round(
                                          (project.tasks.filter(
                                            (task) => task.completed
                                          ).length /
                                            project.tasks.length) *
                                            100
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewDetails(project._id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
