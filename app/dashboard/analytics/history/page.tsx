"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Brain,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  performanceScore: string;
  performanceLevel: string;
  blocks: any[]; // You might want to type this more specifically
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

    fetchDays();
  }, [currentPage, userId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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

      <main className="flex-1">
        <div className="h-full p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">All Days History</h1>
            <p className="text-sm text-gray-500">
              View your complete history of daily tasks and performance
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {days.map((day) => (
                  <Link
                    href={`/dashboard/analytics/day/${day.date}`}
                    key={day.date}
                    className="block transition-colors hover:bg-gray-50"
                  >
                    <Card key={day.date} className="bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-lg">
                              {day.date}
                            </span>
                          </div>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                            {day.performanceLevel}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <ListChecks className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="text-sm text-gray-500">
                                Tasks Completed
                              </div>
                              <div className="font-medium">
                                {day.tasksCompleted}/{day.totalTasks}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="text-sm text-gray-500">
                                Blocks Completed
                              </div>
                              <div className="font-medium">
                                {day.blocksCompleted}/{day.totalBlocks}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="text-sm text-gray-500">
                                Performance Score
                              </div>
                              <div className="font-medium">
                                {day.performanceScore}/10
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {pagination && (
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
