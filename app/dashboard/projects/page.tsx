import React from "react";
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

// ... SidebarContent component stays the same ...
function SidebarContent() {
  return (
    <div className="flex flex-col items-center py-6 space-y-8">
      <div className="flex flex-col items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
      </div>
      <nav className="space-y-8">
        <LayoutDashboard className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <FolderKanban className="h-5 w-5 text-blue-600" />
        <ListTodo className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Calendar className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <BarChart2 className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "Q1 Report",
      description: "Finish the q1 report",
      time: "09:00 - 11:00",
      priority: "Medium",
      progress: 75,
      status: "In Progress",
      tasks: { completed: 15, total: 20 },
    },
    {
      id: 2,
      title: "Launch new Website",
      description: "Launch my first website",
      time: "11:30 - 13:30",
      priority: "Medium",
      progress: 30,
      status: "Planning",
      tasks: { completed: 6, total: 20 },
    },
  ];

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
              <Button className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
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

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {project.title}
                  </CardTitle>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {project.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">{project.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {project.time}
                      </div>
                      <span>
                        {project.tasks.completed}/{project.tasks.total} tasks
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
