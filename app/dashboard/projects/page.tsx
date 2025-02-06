// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   MoreHorizontal,
//   Calendar,
//   Brain,
//   LayoutDashboard,
//   FolderKanban,
//   ListTodo,
//   Repeat,
//   BarChart2,
//   CheckCircle,
//   Menu,
//   Info,
//   GripVertical,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { SidebarContent } from "@/app/components/SideBar";
// import { useAppContext } from "@/app/context/AppContext";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { format } from "date-fns";
// import Link from "next/link";
// import { UserButton } from "@clerk/nextjs";
// import MobileNav from "@/app/components/MobileNav";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress";
// import {
//   DndContext,
//   DragEndEvent,
//   useSensor,
//   useSensors,
//   PointerSensor,
//   KeyboardSensor,
//   closestCenter,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   sortableKeyboardCoordinates,
// } from "@dnd-kit/sortable";

// // Define the allowed priority values
// type Priority = "High" | "Medium" | "Low";

// // Update the Project interface
// export interface Project {
//   completed: boolean;
//   _id: string;
//   name: string;
//   description: string;
//   deadline: Date;
//   time: string;
//   priority: Priority; // Changed from string to Priority
// }

// export default function ProjectsPage() {
//   const { projects, setProjects, addProject } = useAppContext();
//   const router = useRouter();
//   const { userId } = useAuth();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [newProject, setNewProject] = useState({
//     name: "",
//     description: "",
//     deadline: "",
//     time: "",
//     priority: "Medium",
//   });
//   const [activeTab, setActiveTab] = useState("active");
//   const [displayProjects, setDisplayProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       if (!userId) return;
//       try {
//         const response = await fetch(`/api/projects?userId=${userId}`);
//         if (!response.ok) throw new Error("Failed to fetch projects");
//         const data = await response.json();
//         setProjects(data.projects);
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };
//     fetchProjects();
//   }, [userId, setProjects]);

//   // useEffect(() => {
//   //   // getFilteredProjects() returns either active or completed, sorted by priority
//   //   const filtered = getFilteredProjects();
//   //   // We'll start with that order in our local state
//   //   setDisplayProjects(filtered);
//   // }, [activeTab, projects]);

//   const handleInputChange = (e: { target: { name: any; value: any } }) => {
//     const { name, value } = e.target;
//     setNewProject((prev) => ({ ...prev, [name]: value }));
//   };

//   const handlePriorityChange = (value: string) => {
//     setNewProject((prev) => ({ ...prev, priority: value }));
//   };

//   // Update the priorityOrder object with proper typing
//   const priorityOrder: Record<Priority, number> = {
//     High: 1,
//     Medium: 2,
//     Low: 3,
//   } as const;

//   const getFilteredProjects = () => {
//     return projects
//       .filter((project) =>
//         activeTab === "completed" ? project.completed : !project.completed
//       )
//       .sort((a, b) => {
//         // Assert that the priorities are of type Priority
//         const aPriority = a.priority as Priority;
//         const bPriority = b.priority as Priority;

//         // Now TypeScript knows these are valid keys for priorityOrder
//         const priorityDiff =
//           priorityOrder[aPriority] - priorityOrder[bPriority];

//         // // If priorities are equal, sort by deadline
//         // if (priorityDiff === 0 && a.deadline && b.deadline) {
//         //   return a.deadline.getTime() - b.deadline.getTime();
//         // }

//         return priorityDiff;
//       });
//   };

//   const handleAddProject = async () => {
//     if (!userId) return;
//     try {
//       const response = await fetch("/api/projects", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...newProject, userId }),
//       });
//       if (!response.ok) throw new Error("Failed to create project");
//       const data = await response.json();
//       addProject(data.project);
//       setNewProject({
//         name: "",
//         description: "",
//         deadline: "",
//         time: "",
//         priority: "Medium",
//       });
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error("Error creating project:", error);
//     }
//   };

//   const handleViewDetails = (projectId: string) => {
//     router.push(`/dashboard/projects/${projectId}`);
//   };

//   const EmptyProjectsDisplay = () => (
//     <div className="flex flex-col items-center justify-center h-[60vh]">
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
//         <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
//         <p className="text-gray-500 mb-4">
//           Get started by creating your first project!
//         </p>
//         <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
//           <Plus className="h-4 w-4" />
//           Add Your First Project
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <main className="flex-1">
//         {/* Mobile Header */}
//         <div className="md:hidden px-4 py-2 border-b border-gray-200">
//           {/* Three column layout */}
//           <div className="flex items-center justify-between">
//             {/* Left: Menu button */}
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 p-0">
//                 <MobileNav />
//               </SheetContent>
//             </Sheet>

//             {/* Center: Date display */}
//             <div className="text-sm font-medium">
//               {format(new Date(), "MMM d, yyyy")}
//             </div>

//             {/* Right: User button */}
//             <UserButton />
//           </div>
//         </div>

//         <div className="h-full p-8">
//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <h1 className="text-2xl font-semibold">Projects</h1>
//                 <p className="text-sm text-gray-500">
//                   Manage your ongoing projects
//                 </p>
//               </div>

//               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="h-9">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Project
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[525px]">
//                   <DialogHeader>
//                     <DialogTitle className="text-xl">
//                       Add New Project
//                     </DialogTitle>
//                     <DialogDescription className="text-gray-600">
//                       Enter the details for the new project.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="name"
//                         className="text-right text-gray-600"
//                       >
//                         Name
//                       </Label>
//                       <Input
//                         id="name"
//                         name="name"
//                         value={newProject.name}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="description"
//                         className="text-right text-gray-600"
//                       >
//                         Description
//                       </Label>
//                       <Textarea
//                         id="description"
//                         name="description"
//                         value={newProject.description}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="deadline"
//                         className="text-right text-gray-600"
//                       >
//                         Deadline
//                       </Label>
//                       <Input
//                         id="deadline"
//                         name="deadline"
//                         type="date"
//                         value={newProject.deadline}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="time"
//                         className="text-right text-gray-600"
//                       >
//                         Time
//                       </Label>
//                       <Input
//                         id="time"
//                         name="time"
//                         type="time"
//                         value={newProject.time}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="priority"
//                         className="text-right text-gray-600"
//                       >
//                         Priority
//                       </Label>
//                       <Select
//                         onValueChange={handlePriorityChange}
//                         defaultValue={newProject.priority}
//                       >
//                         <SelectTrigger className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600">
//                           <SelectValue placeholder="Select priority" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Low">Low</SelectItem>
//                           <SelectItem value="Medium">Medium</SelectItem>
//                           <SelectItem value="High">High</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button
//                       onClick={handleAddProject}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       Add Project
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </div>

//           <Tabs
//             value={activeTab}
//             onValueChange={setActiveTab}
//             className="w-full mb-6"
//           >
//             <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1 w-full sm:w-auto">
//               <TabsTrigger
//                 value="active"
//                 className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
//               >
//                 Active
//               </TabsTrigger>
//               <TabsTrigger
//                 value="completed"
//                 className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
//               >
//                 Completed
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>

//           {projects.length === 0 ? (
//             <EmptyProjectsDisplay />
//           ) : (
//             <div className="space-y-4">
//               <h2 className="text-sm font-semibold text-gray-500">
//                 Priority Order (Drag to reorder)
//               </h2>
//               {getFilteredProjects().map((project, index) => (
//                 <div
//                   key={project._id}
//                   className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
//                 >
//                   <div className="flex items-center gap-4 p-6">
//                     {/* Left section with drag handle and number */}
//                     <div className="flex w-24 items-center gap-3">
//                       <GripVertical className="h-5 w-5 cursor-move text-gray-400 hover:text-gray-600" />
//                       <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
//                         #{index + 1}
//                       </span>
//                     </div>
//                     {/* Project title and info section */}
//                     <div className="flex items-center gap-4 w-full">
//                       {/* Left: Project title & info */}
//                       <div className="min-w-0">
//                         <h3 className="truncate text-lg font-semibold text-gray-900">
//                           {project.name}
//                         </h3>
//                         <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
//                           <div className="flex items-center gap-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>
//                               {project.deadline
//                                 ? format(
//                                     new Date(project.deadline),
//                                     "MMM d, yyyy"
//                                   )
//                                 : "No deadline"}
//                             </span>
//                           </div>
//                           <span className="text-gray-300">•</span>
//                           <span>
//                             {project.tasks
//                               ? `${
//                                   project.tasks.filter((task) => task.completed)
//                                     .length
//                                 }/${project.tasks.length} tasks`
//                               : "0/0 tasks"}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Center: Progress indicator */}
//                       <div className="hidden sm:block mx-auto w-80 ">
//                         <div className="mb-1 flex justify-between text-xs">
//                           {/* <span className="text-gray-500">Progress</span> */}
//                           <span className="font-medium text-gray-700">
//                             {project.tasks && project.tasks.length > 0
//                               ? Math.round(
//                                   (project.tasks.filter(
//                                     (task) => task.completed
//                                   ).length /
//                                     project.tasks.length) *
//                                     100
//                                 )
//                               : 0}
//                             %
//                           </span>
//                         </div>
//                         {/* Manual, two-div progress bar */}
//                         <div className="h-2 bg-gray-100 rounded-full">
//                           <div
//                             className="h-full bg-blue-600 rounded-full transition-all"
//                             style={{
//                               width: `${
//                                 project.tasks && project.tasks.length > 0
//                                   ? Math.round(
//                                       (project.tasks.filter(
//                                         (task) => task.completed
//                                       ).length /
//                                         project.tasks.length) *
//                                         100
//                                     )
//                                   : 0
//                               }%`,
//                             }}
//                           />
//                         </div>
//                       </div>

//                       {/* Right: Priority badge and actions */}
//                       <div className="flex items-center gap-2">
//                         <div
//                           className={cn(
//                             "rounded-full px-2.5 py-0.5 text-xs font-medium",
//                             {
//                               "bg-red-100 text-red-800":
//                                 project.priority === "High",
//                               "bg-yellow-100 text-yellow-800":
//                                 project.priority === "Medium",
//                               "bg-green-100 text-green-800":
//                                 project.priority === "Low",
//                             }
//                           )}
//                         >
//                           {project.priority}
//                         </div>

//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-8 w-8 text-gray-500 hover:text-gray-900"
//                               >
//                                 <Info className="h-4 w-4" />
//                                 <span className="sr-only">Project Info</span>
//                               </Button>
//                             </TooltipTrigger>
//                             <TooltipContent
//                               side="left"
//                               align="center"
//                               className="max-w-xs p-3"
//                             >
//                               <p className="text-sm">
//                                 {project.description ||
//                                   "No description provided"}
//                               </p>
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>

//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="hidden sm:inline-flex"
//                           onClick={() => handleViewDetails(project._id)}
//                         >
//                           View Details
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   MoreHorizontal,
//   Calendar,
//   Brain,
//   LayoutDashboard,
//   FolderKanban,
//   ListTodo,
//   Repeat,
//   BarChart2,
//   CheckCircle,
//   Menu,
//   Info,
//   GripVertical,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { SidebarContent } from "@/app/components/SideBar";
// import { useAppContext } from "@/app/context/AppContext";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { format } from "date-fns";
// import Link from "next/link";
// import { UserButton } from "@clerk/nextjs";
// import MobileNav from "@/app/components/MobileNav";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress";
// import SortableProjectItem from "@/app/components/SortableProjectItem";

// // DnD Kit Imports
// import {
//   DndContext,
//   DragEndEvent,
//   useSensor,
//   useSensors,
//   PointerSensor,
//   KeyboardSensor,
//   closestCenter,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   sortableKeyboardCoordinates,
// } from "@dnd-kit/sortable";
// import { arrayMove } from "@dnd-kit/sortable";

// // Define the allowed priority values
// type Priority = "High" | "Medium" | "Low";

// // Update the Project interface
// export interface Project {
//   completed: boolean;
//   _id: string;
//   name: string;
//   description: string;
//   deadline: Date;
//   time: string;
//   priority: Priority; // "High" | "Medium" | "Low"
//   tasks?: {
//     completed: boolean;
//     /* add other task fields here */
//   }[];
// }

// export default function ProjectsPage() {
//   const { projects, setProjects, addProject } = useAppContext();
//   const router = useRouter();
//   const { userId } = useAuth();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [newProject, setNewProject] = useState({
//     name: "",
//     description: "",
//     deadline: "",
//     time: "",
//     priority: "Medium",
//   });
//   const [activeTab, setActiveTab] = useState("active");

//   // Load your DnDKit sensors
//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   useEffect(() => {
//     const fetchProjects = async () => {
//       if (!userId) return;
//       try {
//         const response = await fetch(`/api/projects?userId=${userId}`);
//         if (!response.ok) throw new Error("Failed to fetch projects");
//         const data = await response.json();
//         setProjects(data.projects);
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };
//     fetchProjects();
//   }, [userId, setProjects]);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setNewProject((prev) => ({ ...prev, [name]: value }));
//   };

//   const handlePriorityChange = (value: string) => {
//     setNewProject((prev) => ({ ...prev, priority: value }));
//   };

//   const handleAddProject = async () => {
//     if (!userId) return;
//     try {
//       const response = await fetch("/api/projects", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...newProject, userId }),
//       });
//       if (!response.ok) throw new Error("Failed to create project");
//       const data = await response.json();
//       addProject(data.project);
//       setNewProject({
//         name: "",
//         description: "",
//         deadline: "",
//         time: "",
//         priority: "Medium",
//       });
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error("Error creating project:", error);
//     }
//   };

//   const handleViewDetails = (projectId: string) => {
//     router.push(`/dashboard/projects/${projectId}`);
//   };

//   // Separate active vs completed projects
//   const activeProjects = projects.filter((p) => !p.completed);
//   const completedProjects = projects.filter((p) => p.completed);

//   // Example: Save reorder in local state or context.
//   // For simplicity, we reorder `projects` directly, but you can
//   // keep a separate state just for `activeProjects` if you prefer.
//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     if (active.id !== over.id) {
//       setProjects((prevProjects) => {
//         // Only reorder the Active subset
//         const activeSubset = prevProjects.filter((p) => !p.completed);
//         const completedSubset = prevProjects.filter((p) => p.completed);

//         const oldIndex = activeSubset.findIndex(
//           (item) => item._id === active.id
//         );
//         const newIndex = activeSubset.findIndex((item) => item._id === over.id);

//         const newActiveArray = arrayMove(activeSubset, oldIndex, newIndex);
//         return [...newActiveArray, ...completedSubset];
//       });
//     }
//   };

//   const EmptyProjectsDisplay = () => (
//     <div className="flex flex-col items-center justify-center h-[60vh]">
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
//         <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
//         <p className="text-gray-500 mb-4">
//           Get started by creating your first project!
//         </p>
//         <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
//           <Plus className="h-4 w-4" />
//           Add Your First Project
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <main className="flex-1">
//         {/* Mobile Header */}
//         <div className="md:hidden px-4 py-2 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             {/* Left: Menu button */}
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 p-0">
//                 <MobileNav />
//               </SheetContent>
//             </Sheet>

//             {/* Center: Date display */}
//             <div className="text-sm font-medium">
//               {format(new Date(), "MMM d, yyyy")}
//             </div>

//             {/* Right: User button */}
//             <UserButton />
//           </div>
//         </div>

//         <div className="h-full p-8">
//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <h1 className="text-2xl font-semibold">Projects</h1>
//                 <p className="text-sm text-gray-500">
//                   Manage your ongoing projects
//                 </p>
//               </div>

//               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="h-9">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Project
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[525px]">
//                   <DialogHeader>
//                     <DialogTitle className="text-xl">
//                       Add New Project
//                     </DialogTitle>
//                     <DialogDescription className="text-gray-600">
//                       Enter the details for the new project.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="name"
//                         className="text-right text-gray-600"
//                       >
//                         Name
//                       </Label>
//                       <Input
//                         id="name"
//                         name="name"
//                         value={newProject.name}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="description"
//                         className="text-right text-gray-600"
//                       >
//                         Description
//                       </Label>
//                       <Textarea
//                         id="description"
//                         name="description"
//                         value={newProject.description}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="deadline"
//                         className="text-right text-gray-600"
//                       >
//                         Deadline
//                       </Label>
//                       <Input
//                         id="deadline"
//                         name="deadline"
//                         type="date"
//                         value={newProject.deadline}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="time"
//                         className="text-right text-gray-600"
//                       >
//                         Time
//                       </Label>
//                       <Input
//                         id="time"
//                         name="time"
//                         type="time"
//                         value={newProject.time}
//                         onChange={handleInputChange}
//                         className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="priority"
//                         className="text-right text-gray-600"
//                       >
//                         Priority
//                       </Label>
//                       <Select
//                         onValueChange={handlePriorityChange}
//                         defaultValue={newProject.priority}
//                       >
//                         <SelectTrigger className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600">
//                           <SelectValue placeholder="Select priority" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Low">Low</SelectItem>
//                           <SelectItem value="Medium">Medium</SelectItem>
//                           <SelectItem value="High">High</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button
//                       onClick={handleAddProject}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       Add Project
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </div>

//           <Tabs
//             value={activeTab}
//             onValueChange={setActiveTab}
//             className="w-full mb-6"
//           >
//             <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1 w-full sm:w-auto">
//               <TabsTrigger
//                 value="active"
//                 className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
//               >
//                 Active
//               </TabsTrigger>
//               <TabsTrigger
//                 value="completed"
//                 className="flex-1 sm:flex-none text-sm px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
//               >
//                 Completed
//               </TabsTrigger>
//             </TabsList>

//             {/* ------------------- ACTIVE PROJECTS --------------------- */}
//             <TabsContent value="active" className="mt-6">
//               {activeProjects.length === 0 ? (
//                 <EmptyProjectsDisplay />
//               ) : (
//                 <>
//                   <h2 className="text-sm font-semibold text-gray-500 mb-3">
//                     Priority Order (Drag to reorder)
//                   </h2>

//                   <DndContext
//                     sensors={sensors}
//                     collisionDetection={closestCenter}
//                     onDragEnd={handleDragEnd}
//                   >
//                     <SortableContext
//                       // Use project IDs as the items array
//                       items={activeProjects.map((p) => p._id)}
//                       strategy={verticalListSortingStrategy}
//                     >
//                       {activeProjects.map((project, index) => (
//                         <SortableProjectItem
//                           key={project._id}
//                           project={project}
//                           index={index}
//                           onViewDetails={handleViewDetails}
//                         />

//                       ))}
//                     </SortableContext>
//                   </DndContext>
//                 </>
//               )}
//             </TabsContent>

//             {/* ------------------- COMPLETED PROJECTS --------------------- */}
//             <TabsContent value="completed" className="mt-6">
//               {completedProjects.length === 0 ? (
//                 <EmptyProjectsDisplay />
//               ) : (
//                 <>
//                   {/* We do NOT wrap completed projects in DndContext */}
//                   {completedProjects.map((project, index) => (
//                     <div
//                       key={project._id}
//                       className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-3"
//                     >
//                       <div className="flex items-center gap-4 p-6">
//                         {/* (No drag handle in completed) */}
//                         <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 mr-4">
//                           #{index + 1}
//                         </span>

//                         <div className="flex items-center gap-4 w-full">
//                           <div className="min-w-0">
//                             <h3 className="truncate text-lg font-semibold text-gray-900">
//                               {project.name}
//                             </h3>
//                             <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
//                               <div className="flex items-center gap-1">
//                                 <Calendar className="h-4 w-4" />
//                                 <span>
//                                   {project.deadline
//                                     ? format(
//                                         new Date(project.deadline),
//                                         "MMM d, yyyy"
//                                       )
//                                     : "No deadline"}
//                                 </span>
//                               </div>
//                               <span className="text-gray-300">•</span>
//                               <span>
//                                 {project.tasks
//                                   ? `${
//                                       project.tasks.filter(
//                                         (task) => task.completed
//                                       ).length
//                                     }/${project.tasks.length} tasks`
//                                   : "0/0 tasks"}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Completed Projects' progress bar */}
//                           <div className="hidden sm:block mx-auto w-80">
//                             <div className="mb-1 flex justify-between text-xs">
//                               <span className="font-medium text-gray-700">
//                                 {project.tasks && project.tasks.length > 0
//                                   ? Math.round(
//                                       (project.tasks.filter(
//                                         (task) => task.completed
//                                       ).length /
//                                         project.tasks.length) *
//                                         100
//                                     )
//                                   : 0}
//                                 %
//                               </span>
//                             </div>
//                             <div className="h-2 bg-gray-100 rounded-full">
//                               <div
//                                 className="h-full bg-blue-600 rounded-full transition-all"
//                                 style={{
//                                   width: `${
//                                     project.tasks && project.tasks.length > 0
//                                       ? Math.round(
//                                           (project.tasks.filter(
//                                             (task) => task.completed
//                                           ).length /
//                                             project.tasks.length) *
//                                             100
//                                         )
//                                       : 0
//                                   }%`,
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <div
//                               className={cn(
//                                 "rounded-full px-2.5 py-0.5 text-xs font-medium",
//                                 {
//                                   "bg-red-100 text-red-800":
//                                     project.priority === "High",
//                                   "bg-yellow-100 text-yellow-800":
//                                     project.priority === "Medium",
//                                   "bg-green-100 text-green-800":
//                                     project.priority === "Low",
//                                 }
//                               )}
//                             >
//                               {project.priority}
//                             </div>

//                             <TooltipProvider>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8 text-gray-500 hover:text-gray-900"
//                                   >
//                                     <Info className="h-4 w-4" />
//                                     <span className="sr-only">
//                                       Project Info
//                                     </span>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent
//                                   side="left"
//                                   align="center"
//                                   className="max-w-xs p-3"
//                                 >
//                                   <p className="text-sm">
//                                     {project.description ||
//                                       "No description provided"}
//                                   </p>
//                                 </TooltipContent>
//                               </Tooltip>
//                             </TooltipProvider>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="hidden sm:inline-flex"
//                               onClick={() => handleViewDetails(project._id)}
//                             >
//                               View Details
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       </main>
//     </div>
//   );
// }

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

// Priority & Project types
// In your AppContext.ts or models.ts file
// export type Priority = "High" | "Medium" | "Low";

// export interface Project {
//   completed: boolean;
//   _id: string;
//   name: string;
//   description: string;
//   deadline: Date;
//   time: string;
//   priority: Priority; // Change from string to Priority
//   tasks?: {
//     completed: boolean;
//   }[];
//   order: number;
// }

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

      <main className="flex-1">
        {/* Mobile Header */}
        <div className="md:hidden px-4 py-2 border-b border-gray-200">
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
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Add New Project
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Enter the details for the new project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="name"
                        className="text-right text-gray-600"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={newProject.name}
                        onChange={handleInputChange}
                        className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label
                        htmlFor="description"
                        className="text-right text-gray-600 pt-2"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newProject.description}
                        onChange={handleInputChange}
                        className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600 min-h-[100px]"
                        placeholder="Enter project description..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="deadline"
                        className="text-right text-gray-600"
                      >
                        Deadline
                      </Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={newProject.deadline}
                        onChange={handleInputChange}
                        className="col-span-3 border-gray-200 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddProject}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
            className="w-full mb-6"
          >
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

            {/* ------------------- ACTIVE PROJECTS --------------------- */}
            <TabsContent value="active" className="mt-6">
              {activeProjects.length === 0 ? (
                <EmptyProjectsDisplay />
              ) : (
                <>
                  <h2 className="text-sm font-semibold text-gray-500 mb-3">
                    Priority Order (Drag to reorder)
                  </h2>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart} // NEW
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveId(null)} // optional
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
                          // no need for "disableSortable" here, it's the real item
                        />
                      ))}
                    </SortableContext>

                    {/* NEW: Add the DragOverlay. We'll reuse SortableProjectItem for the overlay. */}
                    <DragOverlay>
                      {activeId ? (
                        <SortableProjectItem
                          project={
                            activeProjects.find((p) => p._id === activeId)!
                          }
                          index={0}
                          onViewDetails={handleViewDetails}
                          isOverlay={true} // Add this line
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </>
              )}
            </TabsContent>

            {/* ------------------- COMPLETED PROJECTS --------------------- */}
            <TabsContent value="completed" className="mt-6">
              {" "}
              {completedProjects.length === 0 ? (
                <EmptyProjectsDisplay />
              ) : (
                <>
                  {/* We do NOT wrap completed projects in DndContext */}
                  {completedProjects.map((project, index) => (
                    <div
                      key={project._id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-3"
                    >
                      <div className="flex items-center gap-4 p-6">
                        {/* (No drag handle in completed) */}
                        {/* <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 mr-4">
                            #{index + 1}
                          </span> */}

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

                          {/* Completed Projects' progress bar */}
                          <div className="hidden sm:block mx-auto w-80">
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
                            {/* <div
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                {
                                  "bg-red-100 text-red-800":
                                    project.priority === "High",
                                  "bg-yellow-100 text-yellow-800":
                                    project.priority === "Medium",
                                  "bg-green-100 text-green-800":
                                    project.priority === "Low",
                                }
                              )}
                            >
                              {project.priority}
                            </div> */}

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
                              className="hidden sm:inline-flex"
                              onClick={() => handleViewDetails(project._id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
