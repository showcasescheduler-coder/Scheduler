import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Truck,
  PlusCircle,
  CheckCircle,
  Clock,
  Star,
  GripVertical,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Daily Planner</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Generate your daily plan
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Plan
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-4xl">15/20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              75% completion rate
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={75} aria-label="75% tasks completed" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Blocks Completed</CardDescription>
            <CardTitle className="text-4xl">6/8</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              2 blocks remaining
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={75} aria-label="75% time blocks completed" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Performance Score</CardDescription>
            <CardTitle className="text-4xl">8.5/10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Great performance today!
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={85} aria-label="85% performance score" />
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <div className="flex items-center mb-4">
          <TabsList>
            <TabsTrigger value="today">Active</TabsTrigger>
            <TabsTrigger value="week">Completed</TabsTrigger>
            <TabsTrigger value="month">All</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>In Progress</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Not Started</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
          </div>
        </div>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Morning Routine</CardTitle>
                <CardDescription>6:00 AM - 8:00 AM</CardDescription>
              </div>
              <Badge>In Progress</Badge>
            </CardHeader>
            <CardContent>
              <Progress value={50} className="h-2 mt-2 mb-4" />
              <div className="space-y-2">
                {[
                  {
                    id: 1,
                    title: "Wake up and stretch",
                    duration: "15 min",
                    priority: "Low",
                  },
                  {
                    id: 2,
                    title: "Meditation",
                    duration: "20 min",
                    priority: "High",
                  },
                  {
                    id: 3,
                    title: "Breakfast",
                    duration: "25 min",
                    priority: "Medium",
                  },
                ].map((task) => (
                  <Card key={task.id} className="bg-muted">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox id={`task-${task.id}`} />
                        </div>
                        <div>
                          <label
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {task.title}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {task.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <GripVertical className="h-4 w-4" />
                          <span className="sr-only">Drag handle</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Work Focus</CardTitle>
                <CardDescription>9:00 AM - 12:00 PM</CardDescription>
              </div>
              <Badge variant="outline">Not Started</Badge>
            </CardHeader>
            <CardContent>
              <Progress value={0} className="h-2 mt-2 mb-4" />
              <div className="space-y-2">
                {[
                  {
                    id: 4,
                    title: "Check and respond to emails",
                    duration: "30 min",
                    priority: "Medium",
                  },
                  {
                    id: 5,
                    title: "Project meeting",
                    duration: "60 min",
                    priority: "High",
                  },
                  {
                    id: 6,
                    title: "Work on main project task",
                    duration: "90 min",
                    priority: "High",
                  },
                ].map((task) => (
                  <Card key={task.id} className="bg-muted">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox id={`task-${task.id}`} />
                        </div>
                        <div>
                          <label
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {task.title}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {task.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <GripVertical className="h-4 w-4" />
                          <span className="sr-only">Drag handle</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Exercise</CardTitle>
                <CardDescription>1:00 PM - 2:00 PM</CardDescription>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </CardHeader>
            <CardContent>
              <Progress value={100} className="h-2 mt-2 mb-4" />
              <div className="space-y-2">
                {[
                  {
                    id: 7,
                    title: "Warm-up",
                    duration: "10 min",
                    priority: "Low",
                  },
                  {
                    id: 8,
                    title: "Cardio session",
                    duration: "30 min",
                    priority: "High",
                  },
                  {
                    id: 9,
                    title: "Cool-down and stretching",
                    duration: "20 min",
                    priority: "Medium",
                  },
                ].map((task) => (
                  <Card key={task.id} className="bg-muted">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Checkbox id={`task-${task.id}`} />
                        </div>
                        <div>
                          <label
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {task.title}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {task.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <GripVertical className="h-4 w-4" />
                          <span className="sr-only">Drag handle</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DashboardPage;
