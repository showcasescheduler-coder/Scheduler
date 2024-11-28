import React from "react";
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

export default function StandaloneTasks() {
  const tasks = [
    {
      id: 1,
      name: "Have lunch with mum",
      description: "Meet mum at the coffe shop",
      deadline: "Today at 12:00 PM",
      priority: "Medium",
      duration: "1h",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Review project proposal",
      description: "Go through the Q4 marketing proposal",
      deadline: "Today at 3:00 PM",
      priority: "High",
      duration: "2h",
      status: "in-progress",
    },
    // Add more tasks as needed
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "text-red-800 bg-red-100",
      Medium: "text-yellow-800 bg-yellow-100",
      Low: "text-green-800 bg-green-100",
    };
    return colors[priority];
  };

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

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Tasks</h1>
              <p className="text-sm text-gray-500">
                Manage your standalone tasks
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add Task</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="h-9 bg-transparent border border-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="active"
                  className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  Completed
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
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span>{task.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.description}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.deadline}
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
                        {task.duration}
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

          {/* Task List - Mobile */}
          <div className="md:hidden space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="group">
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="font-medium">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {task.deadline}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {task.duration}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
