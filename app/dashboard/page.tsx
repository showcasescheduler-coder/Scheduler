"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import {
  FolderOpen,
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
import { PreviewSchedule } from "@/app/context/models";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    isPreviewMode,
    setIsPreviewMode,
    previewSchedule,
    setPreviewSchedule,
  } = useAppContext();
  // const [isPreviewMode, setIsPreviewMode] = useState(false);
  // const [previewSchedule, setPreviewSchedule] = useState(null);
  const requestMadeRef = React.useRef(false);
  const [hasProcessedPrompt, setHasProcessedPrompt] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

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
  // Define your dummy schedule data
  const dummySchedule: PreviewSchedule = {
    currentTime: "08:00 AM",
    scheduleRationale:
      "Your schedule is optimized for peak productivity periods.",
    userStartTime: "09:00 AM",
    userEndTime: "05:00 PM",
    blocks: [
      {
        _id: "block-1",
        name: "Morning Deep Work",
        startTime: "09:00 AM",
        endTime: "11:00 AM",
        description: "High-energy tasks during your peak hours.",
        isEvent: false,
        isRoutine: false,
        isStandaloneBlock: true,
        blockType: "deep-work",
        energyLevel: "high",
        tasks: [
          {
            name: "Complete Project Proposal",
            description: "Draft the proposal for the new client project.",
            duration: 120,
            priority: "High",
            isRoutineTask: false,
          },
        ],
      },
      // Add more blocks as needed
    ],
  };

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

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn && !isPreviewMode) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, isPreviewMode, router]);

  // useEffect(() => {
  //   // Only run if we have a promptText and haven't processed it yet
  //   if (promptText && !hasProcessedPrompt) {
  //     const generateSchedule = async () => {
  //       setIsLoading(true);
  //       try {
  //         const intentResponse = await fetch("/api/home-page-intent-analysis", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             userInput: promptText,
  //             startTime: "09:00",
  //             endTime: "17:00",
  //           }),
  //         });

  //         const intentAnalysis = await intentResponse.json();
  //         const endpoint = intentAnalysis.isSpecificRequest
  //           ? "/api/home-page-specific"
  //           : "/api/home-page-non-specific";

  //         const scheduleResponse = await fetch(endpoint, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             userInput: promptText,
  //             startTime: "09:00",
  //             endTime: "17:00",
  //           }),
  //         });

  //         const schedule = await scheduleResponse.json();

  //         if (schedule.blocks) {
  //           setPreviewSchedule(schedule);
  //           setIsPreviewMode(true);
  //         }
  //       } catch (error) {
  //         console.error("Failed to generate schedule:", error);
  //       } finally {
  //         setIsLoading(false);
  //         setHasProcessedPrompt(true); // Mark that we've processed this prompt
  //         setPromptText(""); // Clear the prompt after processing
  //       }
  //     };

  //     generateSchedule();
  //   }
  // }, [promptText]);

  // if (isLoading) {
  //   return <LoadingSpinner />;
  // }

  const OpenNewBlockModal = () => {
    setIsAddBlockDialogOpen(true);
  };

  const OpenNewEventModal = () => {
    setIsAddEventModalOpen(true);
  };

  const OpenNewRoutineModal = () => {
    setIsAddRoutineModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>

      {isLoading ? (
        <LoadingSpinner />
      ) : isPreviewMode && previewSchedule ? (
        <SchedulePreview schedule={previewSchedule} />
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
            {/* Desktop Header */}
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
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Review Documentation
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      11:30 - 12:30
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
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
                  <Card className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                        <Checkbox
                          id="task-checkbox"
                          className="flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <label
                                htmlFor="task-checkbox"
                                className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                              >
                                Update API endpoints documentation
                              </label>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                                Project
                              </span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="focus:outline-none">
                                <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Task</DropdownMenuItem>
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
                      className="absolute top-0 right-0 bottom-0 w-1 bg-red-500"
                      aria-label="High Priority"
                    />
                  </Card>
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm" className="h-8 text-sm">
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

              {/* <Card className="border-gray-200 shadow-sm">
              <CardHeader className="space-y-0 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="text-base font-medium">
                    Review Documentation
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
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
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  11:30 - 12:30
                </div>
              </CardHeader>
              <CardContent>
                <Card className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                      <Checkbox
                        id="task-checkbox"
                        className="flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <label
                              htmlFor="task-checkbox"
                              className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5"
                            >
                              Update API endpoints documentation
                            </label>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                              Project
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Task</DropdownMenuItem>
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
                    className="absolute top-0 right-0 bottom-0 w-1 bg-red-500"
                    aria-label="High Priority"
                  />
                </Card>
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" size="sm" className="h-8 text-sm">
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
            </Card> */}

              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Team Meeting
                  </CardTitle>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-medium">
                    Upcoming
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-3">14:00 - 15:00</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <FolderOpen className="h-4 w-4 md:mr-1" />
                    <span className="hidden md:inline">Join</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Empty state with container and margins
        <div className="mx-4 my-8 md:mx-8">
          <div className="border border-gray-200 rounded-lg p-8 bg-white">
            <div className="flex flex-col items-center justify-center h-[calc(100vh-24rem)] max-w-md mx-auto text-center space-y-6">
              <div className="bg-gray-50 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No scheduled blocks</h3>
                <p className="text-sm text-gray-500">
                  Get started by adding tasks and events, or let AI generate a
                  schedule for you
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <Button className="w-full" variant="outline" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Block
                </Button>
                <Button className="w-full" variant="outline" size="lg">
                  <Clock className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
                <Button className="w-full" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Schedule
                </Button>
              </div>
            </div>
          </div>
        </div> */}

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
