"use Client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SidebarContent } from "@/app/components/SideBar";

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

const SchedulePreview: React.FC<SchedulePreviewProps> = ({
  schedule,
  onModify,
  onConfirm,
  title = "schedule preview",
  description = "review your proposed schedule",
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
    "accept"
  );

  const handleAcceptClick = () => {
    setAuthAction("accept");
    setShowAuthModal(true);
  };

  const handleRegenerateClick = () => {
    setAuthAction("regenerate");
    setShowAuthModal(true);
  };

  const previewBlocks = [
    {
      id: 1,
      name: "Morning Power Hour",
      time: "09:00 - 10:30",
      description:
        "High-energy period optimized for creative and analytical tasks",
      energyLevel: "high",
      isAiSuggested: true,
      tasks: [
        {
          name: "Review and prioritize daily goals",
          duration: 15,
          priority: "high",
          type: "planning",
        },
        {
          name: "Work on main project deliverables",
          duration: 75,
          priority: "high",
          type: "deep-work",
        },
      ],
    },
    {
      id: 2,
      name: "Team Sync",
      time: "11:00 - 12:00",
      description:
        "Scheduled during moderate energy period for collaborative work",
      energyLevel: "medium",
      isEvent: true,
      tasks: [
        {
          name: "Weekly team standup",
          duration: 60,
          priority: "medium",
          type: "meeting",
        },
      ],
    },
    {
      id: 3,
      name: "Focus Block",
      time: "13:30 - 15:00",
      description:
        "Post-lunch recovery period optimized for steady, focused work",
      energyLevel: "medium",
      isAiSuggested: true,
      tasks: [
        {
          name: "Documentation update",
          duration: 45,
          priority: "medium",
          type: "deep-work",
        },
        {
          name: "Code review",
          duration: 45,
          priority: "high",
          type: "deep-work",
        },
      ],
    },
  ];

  const insights = schedule.scheduleRationale
    .split(".")
    .filter(Boolean)
    .slice(0, 3)
    .map((insight) => insight.trim());

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-16 border-r border-gray-200">
        <SidebarContent />
      </aside>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Preview Mode Banner */}
        <div className="bg-blue-50 border-b border-blue-100 p-4">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-sm font-medium text-blue-900">
                  AI-Generated Schedule Preview
                </h2>
                <p className="text-xs text-blue-700">
                  Optimized for your productivity based on behavioral science{" "}
                  {schedule.userStartTime} - {schedule.userEndTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
                onClick={handleRegenerateClick}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAcceptClick}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept Schedule
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto p-4">
          {/* Schedule Rationale */}
          <Card className="mb-6 border-blue-100 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                Schedule Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-green-600" />
                    <span>
                      {/* Deep work scheduled during your peak energy hours
                    (9:00-11:00) */}
                      {insights[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    {/* <span>Strategic breaks added between focus blocks</span> */}
                    {insights[1]}
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span>
                      {/* Similar tasks grouped to minimize context switching */}
                      {insights[2]}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Blocks */}
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

          {/* Preview Footer */}
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Like this schedule?</p>
                <p>
                  Sign up to customize blocks, add your own tasks, and save
                  schedules.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          actionType={authAction}
        />
      </div>
    </div>
  );
};

export default SchedulePreview;
