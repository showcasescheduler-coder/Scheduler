// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   Brain,
//   ListChecks,
//   CheckCircle2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import { SidebarContent } from "@/app/components/SideBar";
// import Link from "next/link";

// interface DayData {
//   date: string;
//   tasksCompleted: number;
//   totalTasks: number;
//   blocksCompleted: number;
//   totalBlocks: number;
//   performanceScore: string;
//   performanceLevel: string;
//   blocks: any[]; // You might want to type this more specifically
// }

// interface PaginationData {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

// export default function AllDaysPage() {
//   const [days, setDays] = useState<DayData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState<PaginationData | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const { userId } = useAuth();

//   useEffect(() => {
//     const fetchDays = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("/api/all-days", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             userId,
//             page: currentPage,
//             limit: 30,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch days data");
//         }

//         const data = await response.json();
//         setDays(data.days);
//         setPagination(data.pagination);
//       } catch (error) {
//         console.error("Error fetching days:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDays();
//   }, [currentPage, userId]);

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//     window.scrollTo(0, 0);
//   };

//   const renderPaginationItems = () => {
//     if (!pagination) return null;

//     const items = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(
//       pagination.totalPages,
//       startPage + maxVisiblePages - 1
//     );

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       items.push(
//         <PaginationItem key={i}>
//           <PaginationLink
//             onClick={() => handlePageChange(i)}
//             isActive={currentPage === i}
//           >
//             {i}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     return items;
//   };

//   return (
//     <div className="flex h-screen bg-white">
//       <aside className="hidden md:block w-16 border-r border-gray-200">
//         <SidebarContent />
//       </aside>

//       <main className="flex-1">
//         <div className="h-full p-8">
//           <div className="mb-8">
//             <h1 className="text-2xl font-semibold">All Days History</h1>
//             <p className="text-sm text-gray-500">
//               View your complete history of daily tasks and performance
//             </p>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center min-h-[400px]">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//             </div>
//           ) : (
//             <>
//               <div className="grid gap-6">
//                 {days.map((day) => (
//                   <Link
//                     href={`/dashboard/analytics/day/${day.date}`}
//                     key={day.date}
//                     className="block transition-colors hover:bg-gray-50"
//                   >
//                     <Card key={day.date} className="bg-white">
//                       <CardContent className="p-6">
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center gap-2">
//                             <CalendarDays className="h-5 w-5 text-blue-600" />
//                             <span className="font-semibold text-lg">
//                               {day.date}
//                             </span>
//                           </div>
//                           <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
//                             {day.performanceLevel}
//                           </span>
//                         </div>

//                         <div className="grid md:grid-cols-3 gap-4 mb-4">
//                           <div className="flex items-center gap-3">
//                             <ListChecks className="h-5 w-5 text-blue-600" />
//                             <div>
//                               <div className="text-sm text-gray-500">
//                                 Tasks Completed
//                               </div>
//                               <div className="font-medium">
//                                 {day.tasksCompleted}/{day.totalTasks}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-3">
//                             <CheckCircle2 className="h-5 w-5 text-blue-600" />
//                             <div>
//                               <div className="text-sm text-gray-500">
//                                 Blocks Completed
//                               </div>
//                               <div className="font-medium">
//                                 {day.blocksCompleted}/{day.totalBlocks}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-3">
//                             <Brain className="h-5 w-5 text-blue-600" />
//                             <div>
//                               <div className="text-sm text-gray-500">
//                                 Performance Score
//                               </div>
//                               <div className="font-medium">
//                                 {day.performanceScore}/10
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </Link>
//                 ))}
//               </div>

//               {pagination && (
//                 <div className="mt-8 flex justify-center">
//                   <Pagination>
//                     <PaginationContent>
//                       <PaginationItem>
//                         <PaginationPrevious
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           className={
//                             !pagination.hasPrevPage
//                               ? "pointer-events-none opacity-50"
//                               : "cursor-pointer"
//                           }
//                         />
//                       </PaginationItem>

//                       {renderPaginationItems()}

//                       <PaginationItem>
//                         <PaginationNext
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           className={
//                             !pagination.hasNextPage
//                               ? "pointer-events-none opacity-50"
//                               : "cursor-pointer"
//                           }
//                         />
//                       </PaginationItem>
//                     </PaginationContent>
//                   </Pagination>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  CheckCircle2,
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
import { useAuth } from "@clerk/nextjs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SidebarContent } from "@/app/components/SideBar";
import Link from "next/link";

interface DayData {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  blocksCompleted: number;
  totalBlocks: number;
  performanceLevel?: string;
  blocks: any[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AllDaysPage() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchDays = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/all-days", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            page: currentPage,
            limit: 30,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch days data");
        }

        const data = await response.json();
        setDays(data.days);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching days:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDays();
    }
  }, [currentPage, userId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Format date to show weekday and month day (e.g., "Friday, February 28")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate task and block completion percentages
  const calculatePercentage = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const renderPaginationItems = () => {
    if (!pagination) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                asChild
              >
                <Link href="/dashboard/analytics" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Analytics
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Days History</h1>
            <p className="text-sm text-gray-500">
              View your complete history of daily tasks and productivity
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {days.map((day) => {
                  const taskPercentage = calculatePercentage(
                    day.tasksCompleted,
                    day.totalTasks
                  );
                  const blockPercentage = calculatePercentage(
                    day.blocksCompleted,
                    day.totalBlocks
                  );

                  return (
                    <Link
                      href={`/dashboard/analytics/day/${day.date}`}
                      key={day.date}
                      className="block transition hover:transform hover:scale-[1.01] duration-200"
                    >
                      <Card className="border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="md:w-56 flex flex-col">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="font-medium text-blue-600">
                                  {formatDate(day.date)}
                                </span>
                              </div>
                              {/* Removed performance level badge */}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium flex items-center">
                                    <ListChecks className="h-4 w-4 text-blue-600 mr-1" />
                                    Tasks
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {day.tasksCompleted}/{day.totalTasks}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${taskPercentage}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium flex items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                                    Blocks
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {day.blocksCompleted}/{day.totalBlocks}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${blockPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="text-gray-400 hidden md:block">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={
                            !pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {renderPaginationItems()}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={
                            !pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {days.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No days found
                  </h3>
                  <p className="text-gray-500">
                    Your task history will appear here once you start using the
                    app.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
