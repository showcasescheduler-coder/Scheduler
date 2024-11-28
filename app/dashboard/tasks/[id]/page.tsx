import React from "react";
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

function SidebarContent() {
  return (
    <div className="flex flex-col items-center py-6 space-y-8">
      <div className="flex flex-col items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
      </div>
      <nav className="space-y-8">
        <LayoutDashboard className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <FolderKanban className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <ListTodo className="h-5 w-5 text-blue-600" />
        <Calendar className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <BarChart2 className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
}

export default function TaskDetails() {
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
                {/* Mobile Menu */}
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
                      Have lunch with mum
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Task Details */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      defaultValue="Have lunch with mum"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      defaultValue="Meet mum at the coffee shop"
                      className="mt-2"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
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
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <Input defaultValue="1h" className="mt-2" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select defaultValue="upcoming">
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
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
                        <SelectTrigger className="mt-2">
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

            {/* Notes or Additional Details */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <Textarea
                    placeholder="Add any additional notes or details about this task..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
