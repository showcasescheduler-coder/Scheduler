"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import {
  Clock,
  Plus,
  Sparkles,
  Menu,
  ChevronDown,
  MoreVertical,
  GripVertical,
  Edit,
  Trash2,
  Check,
  Repeat,
  Brain,
  Info,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleGenerationDialog } from "@/dialog/generateModal";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarContent } from "@/app/components/SideBar";
import { AddEventModal } from "@/dialog/addEventModal";
import { AddRoutineModal } from "@/dialog/addRoutineModal";
import { AddBlockDialog } from "@/dialog/addBlockModal";
import SchedulePreview from "@/app/components/schedulePreview";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserAndDay } from "@/hooks/useUserAndDay";

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
  __v: number;
}

interface Block {
  _id: string;
  dayId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "pending" | "in_progress" | "completed";
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  event: string | null;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isStandaloneBlock?: boolean;
}

export default function Component() {
  const [selectedDay, setSelectedDay] = React.useState<"today" | "tomorrow">(
    "today"
  );
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] = useState(false);
  const { promptText, setPromptText } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isPreviewMode,
    setIsPreviewMode,
    previewSchedule,
    setPreviewSchedule,
  } = useAppContext();

  const [hasProcessedPrompt, setHasProcessedPrompt] = useState(false);
  const { user, day, mutate, isError } = useUserAndDay();

  const LoadingSpinner = () => (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="relative">
        <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-12 text-sm text-gray-500">Generating your schedule...</p>
    </div>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const currentDate = selectedDay === "today" ? today : tomorrow;

  useEffect(() => {
    // Only run if we have a promptText and haven't processed it yet
    if (promptText && !hasProcessedPrompt) {
      const generateSchedule = async () => {
        setIsLoading(true);
        try {
          const intentResponse = await fetch("/api/home-page-intent-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userInput: promptText,
              startTime: "09:00",
              endTime: "17:00",
            }),
          });

          const intentAnalysis = await intentResponse.json();
          const endpoint = intentAnalysis.isSpecificRequest
            ? "/api/home-page-specific"
            : "/api/home-page-non-specific";

          const scheduleResponse = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userInput: promptText,
              startTime: "09:00",
              endTime: "17:00",
            }),
          });

          const schedule = await scheduleResponse.json();

          if (schedule.blocks) {
            setPreviewSchedule(schedule);
            setIsPreviewMode(true);
          }
        } catch (error) {
          console.error("Failed to generate schedule:", error);
        } finally {
          setIsLoading(false);
          setHasProcessedPrompt(true); // Mark that we've processed this prompt
          setPromptText(""); // Clear the prompt after processing
        }
      };

      generateSchedule();
    }
  }, [promptText]);

  const OpenNewBlockModal = () => {
    setIsAddBlockDialogOpen(true);
  };

  const OpenNewEventModal = () => {
    setIsAddEventModalOpen(true);
  };

  const OpenNewRoutineModal = () => {
    setIsAddRoutineModalOpen(true);
  };

  console.log(user, day);
  console.log(previewSchedule);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      {isLoading ? (
        <LoadingSpinner />
      ) : isPreviewMode && previewSchedule ? (
        <SchedulePreview
          schedule={previewSchedule}
          dayId={day?._id} // Use optional chaining
          userId={user?._id} // Use optional chaining
          mutate={mutate}
        />
      ) : (
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-16 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {formatShortDate(currentDate)}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedDay("today")}>
                  Today ({formatShortDate(today)})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDay("tomorrow")}>
                  Tomorrow ({formatShortDate(tomorrow)})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="p-4 md:px-8 md:pt-8">
            <div className="hidden md:block mb-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">Welcome back, Alex</h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(currentDate)}
                  </p>
                </div>
                <Tabs
                  value={selectedDay}
                  onValueChange={(value) =>
                    setSelectedDay(value as "today" | "tomorrow")
                  }
                  className="border border-gray-200 rounded-lg"
                >
                  <TabsList className="h-9 bg-transparent">
                    <TabsTrigger
                      value="today"
                      className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-l-md"
                    >
                      Today
                    </TabsTrigger>
                    <TabsTrigger
                      value="tomorrow"
                      className="text-sm px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-r-md"
                    >
                      Tomorrow
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {/* <UserButton /> */}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <button className="text-sm font-medium text-blue-600 pb-1 border-b-2 border-blue-600">
                  Active
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Completed
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={OpenNewBlockModal}
                >
                  <Plus className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">New Block</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={OpenNewEventModal}
                >
                  <Clock className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Add Event</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={OpenNewRoutineModal}
                >
                  <Repeat className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Add Routine</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 md:bg-blue-600 md:hover:bg-blue-700 md:text-white border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 transition-all md:border-transparent"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Sparkles className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Generate Schedule</span>
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Cards */}
            <div className="space-y-4">
              {day?.blocks.map((block: Block) => (
                <Card key={block._id} className="border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      <div className="flex items-center gap-2">
                        {block.name}
                        {block.isStandaloneBlock && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI Optimized
                          </span>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{block.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        {block.startTime} - {block.endTime}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Block</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Block</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {block.tasks.map((task: Task) => (
                      <Card
                        key={task._id}
                        className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                            <Checkbox
                              id={`task-${task._id}`}
                              checked={task.completed}
                              className="flex-shrink-0 mt-0.5"
                            />
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <label
                                    htmlFor={`task-${task._id}`}
                                    className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                                  >
                                    {task.name}
                                  </label>
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                                    {task.duration}min
                                  </span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
                                          {task.type}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          {task.description}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="focus:outline-none">
                                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Remove from Block
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <div
                          className={`absolute top-0 right-0 bottom-0 w-1 ${
                            task.priority === "High"
                              ? "bg-red-500"
                              : task.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          aria-label="Priority Indicator"
                        />
                      </Card>
                    ))}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      Review Documentation
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI Optimized
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Review App documentation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      8:00 - 12:00
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Card className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                        <Checkbox className="flex-shrink-0 mt-0.5" disabled />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5">
                                Update API endpoints documentation
                              </span>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                                30 min
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
                                      Project
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Needs doingtoday</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <div
                      className="absolute top-0 right-0 bottom-0 w-1bg-red-500"
                      aria-label="Priority Indicator"
                    />
                  </Card>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-sm text-gray-400 cursor-not-allowed"
                      disabled
                    >
                      Add Task
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <footer className="mt-8 pt-4 border-t border-gray-200 px-4 md:px-8">
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(new Date())}
            </p>
          </footer>
        </main>
      )}
      <ScheduleGenerationDialog
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        onGenerateSchedule={(input) => {
          console.log("Generating schedule with:", input);
          setIsDialogOpen(false);
        }}
        isPreviewMode={false}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={() => {}}
      />
      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        blockId={"selectedBlockId && selectedBlockId"}
        updateDay={() => {}}
      />
      <AddBlockDialog
        isOpen={isAddBlockDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddBlock={() => {}}
      />
    </div>
  );
}
