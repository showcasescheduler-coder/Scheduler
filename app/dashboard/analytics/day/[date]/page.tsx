// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   CheckCheck,
//   Clock,
//   ListTodo,
//   LayoutDashboard,
//   ChevronLeft,
//   CheckCircle,
//   X,
//   Brain,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@clerk/nextjs";
// import { SidebarContent } from "@/app/components/SideBar";
// import Link from "next/link";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// interface Task {
//   _id: string;
//   blockId: string;
//   dayId: string;
//   name: string;
//   description: string;
//   duration: string;
//   priority: "High" | "Medium" | "Low";
//   status: "pending" | "in_progress" | "completed";
//   type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   isRoutineTask: boolean;
//   completed: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Block {
//   _id: string;
//   dayId: string;
//   name: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   status: "pending" | "complete" | "incomplete";
//   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   event: string | null;
//   tasks: Task[];
//   createdAt: string;
//   updatedAt: string;
//   meetingLink: string;
// }

// interface DayData {
//   _id: string;
//   date: string;
//   blocks: Block[];
//   performanceScore: number;
//   performanceLevel: string;
//   taskCompletionRate: number;
//   blockCompletionRate: number;
// }

// export default function DayAnalyticsPage({
//   params,
// }: {
//   params: { date: string };
// }) {
//   const [dayData, setDayData] = useState<DayData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { userId } = useAuth();

//   console.log(params.date);

//   useEffect(() => {
//     const fetchDayData = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("/api/analytics-day", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             userId,
//             date: params.date,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch day data");
//         }

//         const data = await response.json();
//         setDayData(data);
//       } catch (error) {
//         console.error("Error fetching day data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDayData();
//   }, [userId, params.date]);

//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     );
//   }

//   if (!dayData) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold">No data available</h2>
//           <p className="text-gray-500">Could not find data for this day</p>
//         </div>
//       </div>
//     );
//   }

//   const totalTasks = dayData.blocks.reduce(
//     (sum, block) => sum + block.tasks.length,
//     0
//   );
//   const completedTasks = dayData.blocks.reduce(
//     (sum, block) => sum + block.tasks.filter((t) => t.completed).length,
//     0
//   );

//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <main className="flex-1">
//         <div className="h-full p-8">
//           <Card className="min-h-[calc(100vh-4rem)] w-full">
//             <CardContent className="h-full p-4 md:p-8 flex flex-col">
//               {/* Header */}
//               <div className="flex-none mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                   <div className="space-y-1">
//                     <div className="flex items-center gap-2">
//                       <Button variant="ghost" size="sm" asChild>
//                         <Link
//                           href="/dashboard/analytics/history"
//                           className="gap-2"
//                         >
//                           <ChevronLeft className="h-4 w-4" />
//                           Back to History
//                         </Link>
//                       </Button>
//                     </div>
//                     <h1 className="text-xl md:text-2xl font-semibold">
//                       Day Overview -{" "}
//                       {new Date(dayData.date).toLocaleDateString()}
//                     </h1>
//                     <p className="text-sm text-gray-500">
//                       {"Detailed view of your day's performance and tasks"}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
//                       {dayData.performanceLevel}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <Card className="bg-white">
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">
//                       Tasks Completed
//                     </CardTitle>
//                     <CheckCheck className="h-4 w-4 text-blue-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">
//                       {completedTasks}/{totalTasks}
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       Total tasks for the day
//                     </p>
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white">
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">
//                       Task Completion
//                     </CardTitle>
//                     <ListTodo className="h-4 w-4 text-blue-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">
//                       {Math.round(dayData.taskCompletionRate)}%
//                     </div>
//                     <Progress
//                       value={dayData.taskCompletionRate}
//                       className="h-1 mt-2"
//                     />
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white">
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">
//                       Block Completion
//                     </CardTitle>
//                     <LayoutDashboard className="h-4 w-4 text-blue-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">
//                       {Math.round(dayData.blockCompletionRate)}%
//                     </div>
//                     <Progress
//                       value={dayData.blockCompletionRate}
//                       className="h-1 mt-2"
//                     />
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white">
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">
//                       Performance Score
//                     </CardTitle>
//                     <Brain className="h-4 w-4 text-blue-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">
//                       {dayData.performanceScore}/10
//                     </div>
//                     <Progress
//                       value={dayData.performanceScore * 10}
//                       className="h-1 mt-2"
//                     />
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Blocks & Tasks */}
//               <div className="flex-grow overflow-hidden flex flex-col min-h-0">
//                 <div className="flex-none mb-4">
//                   <h2 className="text-lg font-semibold">Blocks & Tasks</h2>
//                   <p className="text-sm text-gray-500">
//                     Detailed breakdown of your day
//                   </p>
//                 </div>

//                 <div className="overflow-y-auto flex-grow">
//                   <div className="space-y-4 pb-4">
//                     {dayData.blocks.map((block) => (
//                       <Card
//                         key={block._id}
//                         className="border border-blue-100 bg-white"
//                       >
//                         <CardHeader className="pb-3">
//                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
//                             <div className="flex items-center gap-3 min-w-0">
//                               <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
//                                 <Clock className="h-4 w-4 text-blue-600" />
//                               </div>
//                               <div className="min-w-0 flex-1">
//                                 <h3 className="font-medium text-gray-900 truncate">
//                                   {block.name}
//                                 </h3>
//                                 <p className="text-sm text-gray-500">
//                                   {block.startTime} - {block.endTime}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-sm font-medium text-blue-600 flex-shrink-0">
//                                 {block.tasks.filter((t) => t.completed).length}/
//                                 {block.tasks.length} tasks
//                               </span>
//                               <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
//                                 {block.blockType}
//                               </span>
//                             </div>
//                           </div>
//                         </CardHeader>
//                         <CardContent className="pt-0">
//                           <div className="space-y-2 w-full">
//                             {block.tasks.map((task) => (
//                               <div
//                                 key={task._id}
//                                 className="relative flex items-center gap-2 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-50 transition-colors w-full"
//                               >
//                                 <div
//                                   className={`flex-shrink-0 h-6 w-6 rounded-full ${
//                                     task.completed
//                                       ? "bg-blue-100"
//                                       : "bg-red-100"
//                                   } flex items-center justify-center`}
//                                 >
//                                   {task.completed ? (
//                                     <CheckCircle className="h-3 w-3 text-blue-600" />
//                                   ) : (
//                                     <X className="h-3 w-3 text-red-600" />
//                                   )}
//                                 </div>

//                                 <div className="flex-1 min-w-0 pr-16">
//                                   <TooltipProvider>
//                                     <Tooltip>
//                                       <TooltipTrigger asChild>
//                                         <span className="text-sm font-medium text-gray-700 truncate block">
//                                           {task.name}
//                                         </span>
//                                       </TooltipTrigger>
//                                       <TooltipContent>
//                                         <p className="max-w-xs">{task.name}</p>
//                                       </TooltipContent>
//                                     </Tooltip>
//                                   </TooltipProvider>
//                                   {task.description && (
//                                     <p className="text-sm text-gray-500 truncate">
//                                       {task.description}
//                                     </p>
//                                   )}
//                                 </div>

//                                 <div className="absolute right-3 flex items-center gap-2">
//                                   <span className="flex-shrink-0 px-2 py-1 rounded-full bg-white text-xs font-medium text-gray-600 border border-gray-100">
//                                     {task.duration}m
//                                   </span>
//                                   <span
//                                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                       task.priority === "High"
//                                         ? "bg-red-50 text-red-600"
//                                         : task.priority === "Medium"
//                                         ? "bg-yellow-50 text-yellow-600"
//                                         : "bg-green-50 text-green-600"
//                                     }`}
//                                   >
//                                     {task.priority}
//                                   </span>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
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
  CheckCheck,
  Clock,
  ListTodo,
  LayoutDashboard,
  ChevronLeft,
  CheckCircle,
  X,
  CalendarDays,
  ArrowLeft,
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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";
import { SidebarContent } from "@/app/components/SideBar";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Task {
  _id: string;
  blockId: string;
  dayId: string;
  name: string;
  description: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "in_progress" | "completed";
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  isRoutineTask: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Block {
  _id: string;
  dayId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "pending" | "complete" | "incomplete";
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  event: string | null;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  meetingLink: string;
}

interface DayData {
  _id: string;
  date: string;
  blocks: Block[];
  taskCompletionRate: number;
  blockCompletionRate: number;
}

export default function DayAnalyticsPage({
  params,
}: {
  params: { date: string };
}) {
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchDayData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/analytics-day", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            date: params.date,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch day data");
        }

        const data = await response.json();
        setDayData(data);
      } catch (error) {
        console.error("Error fetching day data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDayData();
    }
  }, [userId, params.date]);

  // Format date nicely (e.g., "Friday, February 28, 2025")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Could not find data for this day</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/dashboard/analytics/history">Back to History</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const totalTasks = dayData.blocks.reduce(
    (sum, block) => sum + block.tasks.length,
    0
  );

  const completedTasks = dayData.blocks.reduce(
    (sum, block) => sum + block.tasks.filter((t) => t.completed).length,
    0
  );

  const totalBlocks = dayData.blocks.length;

  const completedBlocks = dayData.blocks.filter(
    (block) => block.status === "complete"
  ).length;

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Navigation & Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mb-2 -ml-3 pl-2"
                  asChild
                >
                  <Link
                    href="/dashboard/analytics/history"
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to History
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                  {formatDate(dayData.date)}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Daily overview of your tasks and productivity
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center gap-1"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Analytics Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tasks Completed
                </CardTitle>
                <div className="rounded-full bg-blue-50 p-2">
                  <CheckCheck className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {completedTasks}/{totalTasks}
                </div>
                <Progress
                  value={totalTasks ? (completedTasks / totalTasks) * 100 : 0}
                  className="h-1 mt-3 bg-gray-100"
                />
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Task Completion
                </CardTitle>
                <div className="rounded-full bg-green-50 p-2">
                  <ListTodo className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(dayData.taskCompletionRate)}%
                </div>
                <Progress
                  value={dayData.taskCompletionRate}
                  className="h-1 mt-3 bg-gray-100"
                />
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Block Completion
                </CardTitle>
                <div className="rounded-full bg-indigo-50 p-2">
                  <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(dayData.blockCompletionRate)}%
                </div>
                <Progress
                  value={dayData.blockCompletionRate}
                  className="h-1 mt-3 bg-gray-100"
                />
              </CardContent>
            </Card>
          </div>

          {/* Blocks & Tasks */}
          <h2 className="text-xl font-semibold mb-1">Blocks & Tasks</h2>
          <p className="text-sm text-gray-500 mb-4">
            Detailed breakdown of your day
          </p>

          {dayData.blocks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No blocks found
              </h3>
              <p className="text-gray-500">
                There are no blocks scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dayData.blocks.map((block) => (
                <Card
                  key={block._id}
                  className={`border ${
                    block.status === "complete"
                      ? "border-green-100"
                      : block.status === "incomplete"
                      ? "border-red-100"
                      : "border-gray-100"
                  } shadow-sm`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-full ${
                            block.blockType === "deep-work"
                              ? "bg-blue-50"
                              : block.blockType === "planning"
                              ? "bg-indigo-50"
                              : block.blockType === "break"
                              ? "bg-green-50"
                              : block.blockType === "admin"
                              ? "bg-orange-50"
                              : "bg-purple-50"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          <Clock
                            className={`h-5 w-5 ${
                              block.blockType === "deep-work"
                                ? "text-blue-600"
                                : block.blockType === "planning"
                                ? "text-indigo-600"
                                : block.blockType === "break"
                                ? "text-green-600"
                                : block.blockType === "admin"
                                ? "text-orange-600"
                                : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {block.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {block.startTime} - {block.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">
                          {block.tasks.filter((t) => t.completed).length}/
                          {block.tasks.length} tasks
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            block.blockType === "deep-work"
                              ? "bg-blue-50 text-blue-700"
                              : block.blockType === "planning"
                              ? "bg-indigo-50 text-indigo-700"
                              : block.blockType === "break"
                              ? "bg-green-50 text-green-700"
                              : block.blockType === "admin"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {block.blockType.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {block.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {block.tasks.map((task) => (
                          <div
                            key={task._id}
                            className={`flex items-start gap-3 p-3 rounded-lg ${
                              task.completed ? "bg-gray-50/80" : "bg-gray-50"
                            } hover:bg-gray-100 transition-colors`}
                          >
                            <div
                              className={`flex-shrink-0 h-6 w-6 rounded-full ${
                                task.completed ? "bg-green-100" : "bg-red-100"
                              } flex items-center justify-center mt-0.5`}
                            >
                              {task.completed ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-red-600" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p
                                      className={`text-sm font-medium ${
                                        task.completed
                                          ? "text-gray-700"
                                          : "text-gray-900"
                                      } truncate`}
                                    >
                                      {task.name}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{task.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {task.description && (
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded-full bg-white text-xs font-medium text-gray-600 border border-gray-200">
                                  {task.duration}m
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    task.priority === "High"
                                      ? "bg-red-50 text-red-600"
                                      : task.priority === "Medium"
                                      ? "bg-yellow-50 text-yellow-600"
                                      : "bg-green-50 text-green-600"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    task.type === "deep-work"
                                      ? "bg-blue-50 text-blue-600"
                                      : task.type === "planning"
                                      ? "bg-indigo-50 text-indigo-600"
                                      : task.type === "break"
                                      ? "bg-green-50 text-green-600"
                                      : task.type === "admin"
                                      ? "bg-orange-50 text-orange-600"
                                      : "bg-purple-50 text-purple-600"
                                  }`}
                                >
                                  {task.type.replace("-", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">
                        No tasks in this block
                      </p>
                    )}
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
