"use client";
import React from "react";
import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar as CalendarIcon,
  Repeat,
  BarChart2,
  TrendingUp,
  CalendarDays,
  Clock,
  Target,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SidebarContent() {
  return (
    <div className="flex flex-col items-center py-6 space-y-8">
      <div className="flex flex-col items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
      </div>
      <nav className="space-y-8">
        <LayoutDashboard className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <FolderKanban className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <ListTodo className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Calendar className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
        <BarChart2 className="h-5 w-5 text-blue-600" />
      </nav>
    </div>
  );
}

const performanceData = [
  { date: "Mon", score: 7.2 },
  { date: "Tue", score: 8.1 },
  { date: "Wed", score: 6.5 },
  { date: "Thu", score: 9.0 },
  { date: "Fri", score: 8.3 },
  { date: "Sat", score: 7.8 },
  { date: "Sun", score: 8.5 },
];

const recentDays = [
  {
    date: "2024-11-22",
    performanceScore: 8.5,
    tasksCompleted: 18,
    totalTasks: 20,
    blocksCompleted: 6,
    totalBlocks: 7,
    performanceLevel: "Peak Performance",
  },
  {
    date: "2024-11-21",
    performanceScore: 7.2,
    tasksCompleted: 12,
    totalTasks: 15,
    blocksCompleted: 5,
    totalBlocks: 6,
    performanceLevel: "In the Zone",
  },
  // Add more days as needed
];

export default function AnalyticsPage() {
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
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <p className="text-sm text-gray-500">
                  Track your productivity and performance over time
                </p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="week">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Performance Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.2/10</div>
                <p className="text-xs text-muted-foreground">
                  +0.5 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Task Completion
                </CardTitle>
                <ListChecks className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  142/163 tasks completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Block Completion
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  46/50 blocks completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Peak Hours
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10AM-2PM</div>
                <p className="text-xs text-muted-foreground">
                  Most productive time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>
                Your daily performance scores over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calendar and Recent Days */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Select a day to view detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Days</CardTitle>
                <CardDescription>Your latest daily summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDays.map((day) => (
                    <Card key={day.date} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span className="font-medium">{day.date}</span>
                          </div>
                          <span className="text-sm text-blue-600 font-medium">
                            {day.performanceLevel}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Performance
                            </span>
                            <span className="font-medium">
                              {day.performanceScore}/10
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tasks</span>
                            <span className="font-medium">
                              {day.tasksCompleted}/{day.totalTasks} completed
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Blocks
                            </span>
                            <span className="font-medium">
                              {day.blocksCompleted}/{day.totalBlocks} completed
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
