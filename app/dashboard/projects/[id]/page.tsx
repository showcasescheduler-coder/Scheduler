import React from "react";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Plus,
  MoreHorizontal,
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Repeat,
  BarChart2,
  Menu,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function ProjectDetails() {
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
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      Q1 Report
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm">Save</Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Overall Progress</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: "75%" }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>15/20 tasks completed</span>
                      <span>Due Nov 23, 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hidden md:block">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Select defaultValue="in-progress">
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input defaultValue="Q1 Report" className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      defaultValue="Finish the q1 report"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deadline</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="date"
                        defaultValue="2024-11-23"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile-only project settings */}
                  {/* Mobile-only project settings */}
                  <div className="md:hidden space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select defaultValue="in-progress">
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="mt-2 w-full">
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

            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <div className="flex items-center gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              </div>

              {/* Task List */}
              <Card>
                <CardContent className="p-0">
                  <div className="border-b border-gray-200">
                    <Tabs defaultValue="incomplete">
                      <TabsList className="h-10 w-full rounded-none">
                        <TabsTrigger
                          value="incomplete"
                          className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          Incomplete (5)
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                        >
                          Completed (15)
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {/* Task Item */}
                    <div className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Research Phase</h3>
                          <p className="text-sm text-gray-500">
                            Gather market research data
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>2h</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Medium
                        </span>
                        <span>Due Nov 22</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
