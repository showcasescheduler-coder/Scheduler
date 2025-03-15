// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Brain,
//   LayoutDashboard,
//   FolderKanban,
//   ListTodo,
//   Calendar as CalendarIcon,
//   Repeat,
//   BarChart2,
//   TrendingUp,
//   CalendarDays,
//   Clock,
//   Target,
//   CheckCircle2,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   ListChecks,
//   Activity,
//   FolderCheck,
//   CheckSquare,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { useAuth } from "@clerk/nextjs";
// import { SidebarContent } from "@/app/components/SideBar";
// import Link from "next/link"; // Add this import

// interface AnalyticsData {
//   averageTasksPerDay: string;
//   completionRate: string;
//   totalTasksCompleted: number;
//   totalTasks: number;
//   completedProjects: number; // Add completed projects to the interface
//   recentDays: {
//     date: string;
//     tasksCompleted: number;
//     totalTasks: number;
//     blocksCompleted: number;
//     totalBlocks: number;
//   }[];
// }

// // function SidebarContent() {
// //   return (
// //     <div className="flex flex-col items-center py-6 space-y-8">
// //       <div className="flex flex-col items-center gap-2">
// //         <Brain className="h-8 w-8 text-blue-600" />
// //       </div>
// //       <nav className="space-y-8">
// //         <LayoutDashboard className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
// //         <FolderKanban className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
// //         <ListTodo className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
// //         <Calendar className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
// //         <Repeat className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
// //         <BarChart2 className="h-5 w-5 text-blue-600" />
// //       </nav>
// //     </div>
// //   );
// // }

// const performanceData = [
//   { date: "Mon", score: 7.2 },
//   { date: "Tue", score: 8.1 },
//   { date: "Wed", score: 6.5 },
//   { date: "Thu", score: 9.0 },
//   { date: "Fri", score: 8.3 },
//   { date: "Sat", score: 7.8 },
//   { date: "Sun", score: 8.5 },
// ];

// const recentDays = [
//   {
//     date: "2024-11-22",
//     performanceScore: 8.5,
//     tasksCompleted: 18,
//     totalTasks: 20,
//     blocksCompleted: 6,
//     totalBlocks: 7,
//     performanceLevel: "Peak Performance",
//   },
//   {
//     date: "2024-11-21",
//     performanceScore: 7.2,
//     tasksCompleted: 12,
//     totalTasks: 15,
//     blocksCompleted: 5,
//     totalBlocks: 6,
//     performanceLevel: "In the Zone",
//   },
//   // Add more days as needed
// ];

// export default function AnalyticsPage() {
//   const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);
//   const [selectedRange, setSelectedRange] = useState("week");
//   const { userId } = useAuth();

//   // Add this effect to fetch data
//   // Effect to fetch analytics data when range changes
//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setLoading(true);
//       try {
//         // Send POST request with userId in the body
//         const response = await fetch("/api/analytics", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             userId,
//             range: selectedRange,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch analytics data");
//         }

//         const data = await response.json();

//         console.log(data);
//         setAnalyticsData(data);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//         // You might want to set an error state here to show in the UI
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Call the fetch function
//     fetchAnalytics();
//   }, [selectedRange, userId]); // Include userId in dependencies
//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <main className="flex-1">
//         <div className="h-full p-8">
//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <div className="space-y-1">
//                 <h1 className="text-2xl font-semibold">Analytics</h1>
//                 <p className="text-sm text-gray-500">
//                   Track your task completion and productivity
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <Select
//                   defaultValue="week"
//                   onValueChange={(value) => setSelectedRange(value)}
//                   value={selectedRange}
//                 >
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Select time range" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="week">Last 7 days</SelectItem>
//                     <SelectItem value="14">Last 14 days</SelectItem>
//                     <SelectItem value="month">Last 30 days</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>

//           {/* Key Metrics Cards */}
//           <div className="grid gap-6 md:grid-cols-4 mb-8">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Avg. Tasks Per Day
//                 </CardTitle>
//                 <BarChart2 className="h-4 w-4 text-blue-600" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {analyticsData?.averageTasksPerDay}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   Average daily completion
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Completion Rate
//                 </CardTitle>
//                 <ListChecks className="h-4 w-4 text-blue-600" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {analyticsData?.completionRate}%
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {analyticsData?.totalTasksCompleted}/
//                   {analyticsData?.totalTasks} tasks completed
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Total Tasks Completed
//                 </CardTitle>
//                 <CheckSquare className="h-4 w-4 text-blue-600" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {analyticsData?.totalTasksCompleted}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   In selected period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Projects Completed
//                 </CardTitle>
//                 <FolderCheck className="h-4 w-4 text-blue-600" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {analyticsData?.completedProjects}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   In selected period
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Recent Days List */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle>Recent Days</CardTitle>
//                 <CardDescription>Your latest daily summaries</CardDescription>
//               </div>
//               <Button variant="outline" size="sm" asChild>
//                 <Link href="/dashboard/analytics/history">
//                   View Full History
//                 </Link>
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {analyticsData?.recentDays.map((day) => (
//                   <Link
//                     href={`/dashboard/analytics/day/${day.date}`}
//                     key={day.date}
//                     className="block transition-colors hover:bg-muted/60"
//                   >
//                     <Card key={day.date} className="bg-muted/50">
//                       <CardContent className="p-4">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center gap-2">
//                             <CalendarDays className="h-4 w-4" />
//                             <span className="font-medium">{day.date}</span>
//                           </div>
//                         </div>
//                         <div className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span className="text-muted-foreground">Tasks</span>
//                             <span className="font-medium">
//                               {day.tasksCompleted}/{day.totalTasks} completed
//                             </span>
//                           </div>
//                           <div className="flex justify-between text-sm">
//                             <span className="text-muted-foreground">
//                               Blocks
//                             </span>
//                             <span className="font-medium">
//                               {day.blocksCompleted}/{day.totalBlocks} completed
//                             </span>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </Link>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
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
  FolderCheck,
  CheckSquare,
  ChevronRight as ChevronRightIcon,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { useAuth, UserButton } from "@clerk/nextjs";
import { SidebarContent } from "@/app/components/SideBar";
import MobileNav from "@/app/components/MobileNav";
import Link from "next/link";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AnalyticsData {
  averageTasksPerDay: string;
  completionRate: string;
  totalTasksCompleted: number;
  totalTasks: number;
  completedProjects: number;
  recentDays: {
    date: string;
    tasksCompleted: number;
    totalTasks: number;
    blocksCompleted: number;
    totalBlocks: number;
  }[];
}

interface DayData {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  blocksCompleted: number;
  totalBlocks: number;
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

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("week");
  const { userId } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            range: selectedRange,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        console.log(data);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedRange, userId]);

  // Format date to show weekday and month day (e.g., "Fri, Feb 28")
  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get label for today or yesterday
  const getDateLabel = (dateString: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(dateString);

    if (checkDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return "Today";
    } else if (
      checkDate.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)
    ) {
      return "Yesterday";
    }
    return "";
  };

  // Sample data for development
  const sampleDays: DayData[] = [
    {
      date: "2025-02-28",
      tasksCompleted: 4,
      totalTasks: 5,
      blocksCompleted: 1,
      totalBlocks: 4,
    },
    {
      date: "2025-02-27",
      tasksCompleted: 0,
      totalTasks: 2,
      blocksCompleted: 0,
      totalBlocks: 3,
    },
    {
      date: "2025-02-26",
      tasksCompleted: 0,
      totalTasks: 19,
      blocksCompleted: 0,
      totalBlocks: 9,
    },
    {
      date: "2025-02-25",
      tasksCompleted: 3,
      totalTasks: 22,
      blocksCompleted: 1,
      totalBlocks: 10,
    },
    {
      date: "2025-02-24",
      tasksCompleted: 2,
      totalTasks: 22,
      blocksCompleted: 1,
      totalBlocks: 11,
    },
    {
      date: "2025-02-23",
      tasksCompleted: 0,
      totalTasks: 0,
      blocksCompleted: 0,
      totalBlocks: 0,
    },
  ];

  // Use real data if available, otherwise use sample data
  const recentDays = analyticsData?.recentDays || sampleDays;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto">
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

        <div className="p-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <p className="text-sm text-gray-500">
                  Track your task completion and productivity
                </p>
              </div>
              <div className="flex gap-2">
                <Select
                  defaultValue="week"
                  onValueChange={(value) => setSelectedRange(value)}
                  value={selectedRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Tasks Per Day
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.averageTasksPerDay || "1.4"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average daily completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <ListChecks className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.completionRate || "10.9"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalTasksCompleted || "10"}/
                  {analyticsData?.totalTasks || "92"} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tasks Completed
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.totalTasksCompleted || "10"}
                </div>
                <p className="text-xs text-muted-foreground">
                  In selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projects Completed
                </CardTitle>
                <FolderCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.completedProjects || "2"}
                </div>
                <p className="text-xs text-muted-foreground">
                  In selected period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Days Section */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Recent Days</h2>
              <p className="text-sm text-gray-500">
                Your latest daily summaries
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/dashboard/analytics/history"
                className="flex items-center gap-1"
              >
                View Full History
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Day Cards */}
          <div className="space-y-4">
            {recentDays.map((day) => {
              // Skip days with no tasks or blocks
              if (day.totalTasks === 0 && day.totalBlocks === 0) return null;

              const formattedDate = formatDateShort(day.date);
              const dateLabel = getDateLabel(day.date);

              // Calculate task completion percentage for the progress bar width
              const taskCompletionWidth =
                day.totalTasks > 0
                  ? (day.tasksCompleted / day.totalTasks) * 100
                  : 0;

              // Calculate block completion percentage for the progress bar width
              const blockCompletionWidth =
                day.totalBlocks > 0
                  ? (day.blocksCompleted / day.totalBlocks) * 100
                  : 0;

              return (
                <Link
                  href={`/dashboard/analytics/day/${day.date}`}
                  key={day.date}
                  className="block"
                >
                  <div className="border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                    <div className="flex flex-col md:flex-row">
                      {/* Date column */}
                      <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 md:w-40 flex flex-col justify-center bg-gray-50">
                        <div className="text-blue-600 font-medium">
                          {formattedDate}
                        </div>
                        {dateLabel && (
                          <div className="text-xs text-gray-500">
                            {dateLabel}
                          </div>
                        )}
                      </div>

                      {/* Tasks and blocks column */}
                      <div className="flex-1 p-4">
                        <div className="space-y-3">
                          {/* Tasks row */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                Tasks
                              </span>
                              <span className="text-sm font-medium">
                                {day.tasksCompleted}/{day.totalTasks}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${taskCompletionWidth}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Blocks row */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                Blocks
                              </span>
                              <span className="text-sm font-medium">
                                {day.blocksCompleted}/{day.totalBlocks}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${blockCompletionWidth}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow column */}
                      <div className="hidden md:flex items-center justify-center p-4 text-gray-400">
                        <ChevronRightIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
