"use Client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import {
  Clock,
  Plus,
  AlertCircle,
  MoreVertical,
  GripVertical,
  Check,
  X,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Info,
  Battery,
  Zap,
  Brain,
  Lightbulb,
  EyeIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AuthModal from "@/dialog/authModal";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// interface Task {
//   id: string;
//   name: string;
//   type?: string;
//   priority?: "high" | "medium" | "low";
// }

interface Block {
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  isEvent: boolean;
  isRoutine: boolean;
  isStandaloneBlock: boolean;
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  energyLevel: "high" | "medium" | "low";
  tasks: Task[];
}

interface SchedulePreviewProps {
  schedule: Schedule;
  onModify?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  dayId?: string; // Make optional since guest users won't have this
  userId?: string; // Make optional since guest users won't have this
  mutate: () => Promise<any>; // Update the type to match SWR's mutate
}

interface Schedule {
  currentTime: string;
  scheduleRationale: string;
  userStartTime: string;
  userEndTime: string;
  blocks: Block[];
}

interface Task {
  name: string;
  description: string;
  duration: number;
  priority: "High" | "Medium" | "Low";
  isRoutineTask: boolean;
}

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
    <p className="mt-12 text-sm text-gray-500">Saving your schedule...</p>
  </div>
);

const SchedulePreview: React.FC<SchedulePreviewProps> = ({
  schedule,
  dayId,
  userId,
  mutate,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
    "accept"
  );
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const { setIsPreviewMode, setPreviewSchedule } = useAppContext();
  const { isSignedIn, isLoaded } = useAuth(); // Add this to check auth status

  const handleAcceptClick = () => {
    setAuthAction("accept");
    setShowAuthModal(true);
  };

  const handleRegenerateClick = () => {
    setAuthAction("regenerate");
    setShowAuthModal(true);
  };

  const handleSaveGeneratedSchedule = async () => {
    // First check if user is authenticated
    if (!isSignedIn) {
      setAuthAction("accept");
      setShowAuthModal(true);
      return;
    }

    // Proceed with save if user is authenticated
    if (!dayId || !userId) {
      toast.error("Missing required information. Please try again.");
      return;
    }

    try {
      setIsGeneratingSchedule(true);
      const schedulerResponse = await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayId,
          schedule,
          userId,
        }),
      });

      if (!schedulerResponse.ok) {
        throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
      }

      // Call mutate without arguments to trigger a refetch
      await mutate();

      // Reset the preview mode
      setIsPreviewMode(false);
      setPreviewSchedule(null);

      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const insights = schedule.scheduleRationale
    .split(".")
    .filter(Boolean)
    .slice(0, 3)
    .map((insight) => insight.trim());

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-6">
        <Card className="border-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl font-semibold">
                  Schedule Preview
                </CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                  Draft Mode
                </span>
              </div>
              <div className="flex items-center gap-3">
                {userId && (
                  <Button
                    variant="outline"
                    size="default"
                    className="bg-white hover:bg-gray-50 border-gray-200"
                    onClick={() => {
                      localStorage.removeItem("schedule");
                      localStorage.setItem("isPreviewMode", "false");
                      setIsPreviewMode(false);
                      setPreviewSchedule(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="default"
                  className="bg-white hover:bg-gray-50 border-gray-200"
                  onClick={handleRegenerateClick}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  size="default"
                  className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                  onClick={handleSaveGeneratedSchedule}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Schedule
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {schedule.userStartTime} - {schedule.userEndTime}
            </p>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-600" />
                  <span>{insights[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>{insights[1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span>{insights[2]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the schedule blocks code remains the same */}
        <div className="space-y-4">
          {schedule.blocks.map((block, index) => (
            <Card key={index} className="border-gray-200 shadow-sm">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {block.tasks.map((task, taskIndex) => (
                  <Card
                    key={taskIndex}
                    className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                        <Checkbox className="flex-shrink-0 mt-0.5" disabled />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5">
                                {task.name}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
                                {task.duration}min
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
                                      {block.blockType}
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
          ))}
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionType={authAction}
      />
    </div>
  );
};

export default SchedulePreview;
