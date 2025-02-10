"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import {
  Clock,
  Check,
  X,
  Sparkles,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import AuthModal from "@/dialog/authModal";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

/* -------------- Interfaces -------------- */
interface Task {
  id: string | null;
  name: string;
  duration: number;
  projectId: string | null;
  routineId: string | null;
  eventId: string | null;
}

interface Block {
  name: string;
  startTime: string;
  endTime: string;
  type:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  routineId: string | null;
  tasks: Task[];
}

interface Schedule {
  currentTime?: string;
  scheduleRationale: string;
  userStartTime?: string;
  userEndTime?: string;
  blocks: Block[];
  date?: string; //
}

interface SchedulePreviewProps {
  schedule: Schedule;
  onModify?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  dayId?: string;
  userId?: string;
  mutate: () => Promise<any>;
  onGenerateSchedule: () => void;
}

/* -------------- Loading Spinner -------------- */
const LoadingSpinner = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-screen -mt-16">
    <div className="relative">
      <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
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

/* -------------- Badges -------------- */
const BlockTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const typeColors = {
    "deep-work": "bg-purple-50 text-purple-700",
    break: "bg-green-50 text-green-700",
    meeting: "bg-blue-50 text-blue-700",
    health: "bg-red-50 text-red-700",
    exercise: "bg-orange-50 text-orange-700",
    admin: "bg-gray-50 text-gray-700",
    personal: "bg-pink-50 text-pink-700",
  };

  const color =
    typeColors[type as keyof typeof typeColors] || "bg-gray-50 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const RoutineBadge: React.FC = () => (
  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
    Routine
  </span>
);

const ProjectBadge: React.FC = () => (
  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
    Project
  </span>
);

/* -------------- Schedule Preview -------------- */
const SchedulePreview: React.FC<SchedulePreviewProps> = ({
  schedule,
  dayId,
  userId,
  mutate,
  onGenerateSchedule,
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { setIsPreviewMode, setPreviewSchedule, setDay } = useAppContext();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
    "accept"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const scheduleId = JSON.stringify({
      blocks: schedule.blocks.map((block) => block.name).join(","),
      rationale: schedule.scheduleRationale,
    });

    const animatedSchedules = JSON.parse(
      localStorage.getItem("animatedSchedules") || "{}"
    );

    if (!animatedSchedules[scheduleId]) {
      setShowAnimation(true);
      animatedSchedules[scheduleId] = true;
      localStorage.setItem(
        "animatedSchedules",
        JSON.stringify(animatedSchedules)
      );
    }
  }, [schedule]);

  /* -------------- Handlers -------------- */
  const handleRegenerateClick = () => {
    if (!isSignedIn) {
      setAuthAction("regenerate");
      setShowAuthModal(true);
      return;
    }
    onGenerateSchedule();
  };

  const handleDiscardClick = () => {
    localStorage.removeItem("schedule");
    localStorage.setItem("isPreviewMode", "false");
    setIsPreviewMode(false);
    setPreviewSchedule(null);
  };

  const handleSaveGeneratedSchedule = async () => {
    if (!isSignedIn) {
      setAuthAction("accept");
      setShowAuthModal(true);
      return;
    }

    if (!dayId || !userId) {
      toast.error("Missing required information. Please try again.");
      return;
    }

    try {
      setIsSaving(true);

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

      const freshDay = await schedulerResponse.json();

      // Update context state
      setDay(freshDay);
      // Revalidate SWR data
      mutate();

      // Exit preview
      setIsPreviewMode(false);
      setPreviewSchedule(null);

      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------- Render -------------- */
  if (isSaving) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-blue-600">Preview</h1>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {schedule.date
                    ? format(new Date(schedule.date), "MMMM d, yyyy")
                    : format(new Date(), "MMMM d, yyyy")}
                </h2>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {schedule.userStartTime || "Start"} -{" "}
                  {schedule.userEndTime || "End"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {userId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={handleDiscardClick}
                >
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={handleRegenerateClick}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveGeneratedSchedule}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-gray-600 leading-relaxed"
            >
              {showAnimation
                ? schedule.scheduleRationale.split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {char}
                    </motion.span>
                  ))
                : schedule.scheduleRationale}
            </motion.p>
          </div>
        </div>

        {/* Schedule Blocks */}
        <div className="space-y-4">
          {schedule.blocks.map((block, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-medium">
                      {block.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <BlockTypeBadge type={block.type} />
                      {block.routineId && <RoutineBadge />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {block.startTime} - {block.endTime}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {block.tasks.map((task, taskIndex) => (
                    <motion.div
                      key={taskIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: taskIndex * 0.05 }}
                      className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
                    >
                      <Checkbox className="flex-shrink-0" disabled />
                      <div className="flex items-center gap-2 flex-grow">
                        <span className="text-sm font-medium">{task.name}</span>
                        {task.routineId && <RoutineBadge />}
                        {task.projectId && <ProjectBadge />}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {task.duration}min
                      </span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionType={authAction}
      />
    </div>
  );
};

export default SchedulePreview;
