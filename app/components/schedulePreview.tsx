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
                  {format(new Date(), "MMMM d, yyyy")}
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

// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Clock,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import AuthModal from "@/dialog/authModal";
// import { useAppContext } from "../context/AppContext";
// import { motion } from "framer-motion";

// /* -------------- Interfaces -------------- */
// interface Task {
//   id: string | null;
//   name: string;
//   duration: number;
//   projectId: string | null;
//   routineId: string | null;
//   eventId: string | null;
// }

// interface Block {
//   name: string;
//   startTime: string;
//   endTime: string;
//   type:
//     | "deep-work"
//     | "break"
//     | "meeting"
//     | "health"
//     | "exercise"
//     | "admin"
//     | "personal";
//   routineId: string | null;
//   tasks: Task[];
// }

// interface Schedule {
//   currentTime?: string;
//   scheduleRationale: string;
//   userStartTime?: string;
//   userEndTime?: string;
//   blocks: Block[];
// }

// interface SchedulePreviewProps {
//   schedule: Schedule;
//   onModify?: () => void;
//   onConfirm?: () => void;
//   title?: string;
//   description?: string;
//   dayId?: string;
//   userId?: string;
//   mutate: () => Promise<any>;
//   onGenerateSchedule: () => void;
// }

// /* -------------- Loading Spinner -------------- */
// const LoadingSpinner = () => (
//   <div className="flex-1 flex flex-col items-center justify-center min-h-screen -mt-16">
//     <div className="relative">
//       <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
//       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
//         <div className="flex gap-1">
//           {[...Array(3)].map((_, i) => (
//             <div
//               key={i}
//               className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//               style={{ animationDelay: `${i * 0.15}s` }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//     <p className="mt-12 text-sm text-gray-500">Saving your schedule...</p>
//   </div>
// );

// /* -------------- Block Type Badge -------------- */
// const BlockTypeBadge: React.FC<{ type: string }> = ({ type }) => {
//   const typeColors = {
//     "deep-work": "bg-purple-50 text-purple-700",
//     break: "bg-green-50 text-green-700",
//     meeting: "bg-blue-50 text-blue-700",
//     health: "bg-red-50 text-red-700",
//     exercise: "bg-orange-50 text-orange-700",
//     admin: "bg-gray-50 text-gray-700",
//     personal: "bg-pink-50 text-pink-700",
//   };

//   const color =
//     typeColors[type as keyof typeof typeColors] || "bg-gray-50 text-gray-700";

//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
//     >
//       {type.charAt(0).toUpperCase() + type.slice(1)}
//     </span>
//   );
// };

// /* -------------- Schedule Preview -------------- */
// const SchedulePreview: React.FC<SchedulePreviewProps> = ({
//   schedule,
//   dayId,
//   userId,
//   mutate,
//   onGenerateSchedule,
// }) => {
//   const { isSignedIn, isLoaded } = useAuth();
//   const { setIsPreviewMode, setPreviewSchedule, setDay } = useAppContext();

//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
//     "accept"
//   );
//   const [isSaving, setIsSaving] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);

//   useEffect(() => {
//     const scheduleId = JSON.stringify({
//       blocks: schedule.blocks.map((block) => block.name).join(","),
//       rationale: schedule.scheduleRationale,
//     });

//     const animatedSchedules = JSON.parse(
//       localStorage.getItem("animatedSchedules") || "{}"
//     );

//     if (!animatedSchedules[scheduleId]) {
//       setShowAnimation(true);
//       animatedSchedules[scheduleId] = true;
//       localStorage.setItem(
//         "animatedSchedules",
//         JSON.stringify(animatedSchedules)
//       );
//     }
//   }, [schedule]);

//   /* -------------- Handlers -------------- */
//   const handleRegenerateClick = () => {
//     if (!isSignedIn) {
//       setAuthAction("regenerate");
//       setShowAuthModal(true);
//       return;
//     }
//     onGenerateSchedule();
//   };

//   const handleDiscardClick = () => {
//     localStorage.removeItem("schedule");
//     localStorage.setItem("isPreviewMode", "false");
//     setIsPreviewMode(false);
//     setPreviewSchedule(null);
//   };

//   const handleSaveGeneratedSchedule = async () => {
//     if (!isSignedIn) {
//       setAuthAction("accept");
//       setShowAuthModal(true);
//       return;
//     }

//     if (!dayId || !userId) {
//       toast.error("Missing required information. Please try again.");
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const schedulerResponse = await fetch("/api/scheduler", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           dayId,
//           schedule,
//           userId,
//         }),
//       });

//       if (!schedulerResponse.ok) {
//         throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
//       }

//       const freshDay = await schedulerResponse.json();

//       // Update context state
//       setDay(freshDay);
//       // Revalidate SWR data
//       mutate();

//       // Exit preview
//       setIsPreviewMode(false);
//       setPreviewSchedule(null);

//       toast.success("Schedule saved successfully!");
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//       toast.error("Failed to save schedule. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   /* -------------- Render -------------- */
//   if (isSaving) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-blue-600">Preview</h1>
//               </div>
//               <div className="flex items-center gap-2">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {format(new Date(), "MMMM d, yyyy")}
//                 </h2>
//                 <span className="text-sm text-gray-600 flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {schedule.userStartTime || "Start"} -{" "}
//                   {schedule.userEndTime || "End"}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {userId && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="bg-white"
//                   onClick={handleDiscardClick}
//                 >
//                   <X className="h-4 w-4 mr-2" />
//                   Discard
//                 </Button>
//               )}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={handleRegenerateClick}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="text-sm text-gray-600 leading-relaxed"
//             >
//               {showAnimation
//                 ? schedule.scheduleRationale.split("").map((char, index) => (
//                     <motion.span
//                       key={index}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ delay: index * 0.02 }}
//                     >
//                       {char}
//                     </motion.span>
//                   ))
//                 : schedule.scheduleRationale}
//             </motion.p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <div className="flex items-center gap-2">
//                     <CardTitle className="text-base font-medium">
//                       {block.name}
//                     </CardTitle>
//                     <BlockTypeBadge type={block.type} />
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <Clock className="h-4 w-4" />
//                     {block.startTime} - {block.endTime}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="pt-2">
//                   {block.tasks.map((task, taskIndex) => (
//                     <motion.div
//                       key={taskIndex}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.3, delay: taskIndex * 0.05 }}
//                       className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                     >
//                       <Checkbox className="flex-shrink-0" disabled />
//                       <span className="text-sm font-medium flex-grow">
//                         {task.name}
//                       </span>
//                       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                         {task.duration}min
//                       </span>
//                     </motion.div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Auth Modal */}
//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//         actionType={authAction}
//       />
//     </div>
//   );
// };

// export default SchedulePreview;

// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth, UserButton } from "@clerk/nextjs";
// import {
//   Clock,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { format } from "date-fns";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Checkbox } from "@/components/ui/checkbox";
// import AuthModal from "@/dialog/authModal";
// import { useAppContext } from "../context/AppContext";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import MobileNav from "./MobileNav";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { motion } from "framer-motion";

// /* -------------- Interfaces -------------- */
// interface Task {
//   name: string;
//   description: string;
//   duration: number;
//   priority: "High" | "Medium" | "Low";
//   isRoutineTask: boolean;
// }

// interface Block {
//   name: string;
//   startTime: string;
//   endTime: string;
//   description: string;
//   isEvent: boolean;
//   isRoutine: boolean;
//   isStandaloneBlock: boolean;
//   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   energyLevel: "high" | "medium" | "low";
//   tasks: Task[];
// }

// interface Schedule {
//   currentTime: string;
//   scheduleRationale: string;
//   userStartTime: string;
//   userEndTime: string;
//   blocks: Block[];
// }

// interface SchedulePreviewProps {
//   schedule: Schedule;
//   onModify?: () => void;
//   onConfirm?: () => void;
//   title?: string;
//   description?: string;
//   dayId?: string; // Make optional since guest users won't have this
//   userId?: string; // Make optional since guest users won't have this
//   mutate: () => Promise<any>;
//   onGenerateSchedule: () => void;
// }

// /* -------------- Loading Spinner -------------- */
// const LoadingSpinner = () => (
//   <div className="flex-1 flex flex-col items-center justify-center min-h-screen -mt-16">
//     <div className="relative">
//       <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
//       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
//         <div className="flex gap-1">
//           {[...Array(3)].map((_, i) => (
//             <div
//               key={i}
//               className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//               style={{ animationDelay: `${i * 0.15}s` }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//     <p className="mt-12 text-sm text-gray-500">Saving your schedule...</p>
//   </div>
// );

// /* -------------- Schedule Preview -------------- */
// const SchedulePreview: React.FC<SchedulePreviewProps> = ({
//   schedule,
//   dayId,
//   userId,
//   mutate,
//   onGenerateSchedule,
// }) => {
//   const { isSignedIn, isLoaded } = useAuth(); // Auth state
//   const { setIsPreviewMode, setPreviewSchedule, setDay } = useAppContext();

//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
//     "accept"
//   );
//   const [isSaving, setIsSaving] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);

//   useEffect(() => {
//     // Generate a unique ID for this schedule (you can use any unique property combination)
//     const scheduleId = JSON.stringify({
//       startTime: schedule.userStartTime,
//       endTime: schedule.userEndTime,
//       rationale: schedule.scheduleRationale,
//     });

//     // Check if we've shown animation for this specific schedule
//     const animatedSchedules = JSON.parse(
//       localStorage.getItem("animatedSchedules") || "{}"
//     );

//     if (!animatedSchedules[scheduleId]) {
//       setShowAnimation(true);
//       // Mark this schedule as animated
//       animatedSchedules[scheduleId] = true;
//       localStorage.setItem(
//         "animatedSchedules",
//         JSON.stringify(animatedSchedules)
//       );
//     }
//   }, [schedule]);

//   /* -------------- Handlers -------------- */
//   // If user is not signed in, we open the AuthModal. Otherwise, call onGenerateSchedule.
//   const handleRegenerateClick = () => {
//     if (!isSignedIn) {
//       setAuthAction("regenerate");
//       setShowAuthModal(true);
//       return;
//     }
//     onGenerateSchedule();
//   };

//   const handleDiscardClick = () => {
//     localStorage.removeItem("schedule");
//     localStorage.setItem("isPreviewMode", "false");
//     setIsPreviewMode(false);
//     setPreviewSchedule(null);
//   };

//   // Save schedule to DB
//   const handleSaveGeneratedSchedule = async () => {
//     if (!isSignedIn) {
//       setAuthAction("accept");
//       setShowAuthModal(true);
//       return;
//     }

//     if (!dayId || !userId) {
//       toast.error("Missing required information. Please try again.");
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const schedulerResponse = await fetch("/api/scheduler", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           dayId,
//           schedule,
//           userId,
//         }),
//       });

//       if (!schedulerResponse.ok) {
//         throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
//       }

//       const freshDay = await schedulerResponse.json();

//       // Normalize tasks
//       const normalizedDay = {
//         ...freshDay,
//         blocks: freshDay.blocks.map((block: any) => ({
//           ...block,
//           tasks: block.tasks.map((task: any) => ({
//             ...task,
//             block: block._id,
//             blockId: undefined,
//           })),
//         })),
//       };

//       // Update context state
//       setDay(normalizedDay);
//       // Revalidate SWR data
//       mutate();

//       // Exit preview
//       setIsPreviewMode(false);
//       setPreviewSchedule(null);

//       toast.success("Schedule saved successfully!");
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//       toast.error("Failed to save schedule. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   /* -------------- Render -------------- */
//   if (isSaving) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       {/* MOBILE NAV EXAMPLE (optional) */}
//       {/*
//         If you want to keep the mobile nav for small screens, you can uncomment
//         the section below or adjust to your desired layout.
//       */}
//       {/*
//       <div className="md:hidden px-4 py-3 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <div className="w-8">
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 p-0">
//                 <MobileNav />
//               </SheetContent>
//             </Sheet>
//           </div>
//           <div className="text-sm font-medium">
//             {format(new Date(), "MMM d, yyyy")}
//           </div>
//           <div className="w-8">{isSignedIn ? <UserButton /> : null}</div>
//         </div>
//       </div>
//       */}

//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-blue-600">Preview</h1>
//               </div>
//               <div className="flex items-center gap-2">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {format(new Date(), "MMMM d, yyyy")}
//                 </h2>
//                 <span className="text-sm text-gray-600 flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Discard button only if userId present, otherwise optional */}
//               {userId && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="bg-white"
//                   onClick={handleDiscardClick}
//                 >
//                   <X className="h-4 w-4 mr-2" />
//                   Discard
//                 </Button>
//               )}

//               {/* <span className="px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-md">
//                 Preview Mode
//               </span> */}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={handleRegenerateClick}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="text-sm text-gray-600 leading-relaxed"
//             >
//               {showAnimation
//                 ? schedule.scheduleRationale.split("").map((char, index) => (
//                     <motion.span
//                       key={index}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ delay: index * 0.02 }}
//                     >
//                       {char}
//                     </motion.span>
//                   ))
//                 : schedule.scheduleRationale}
//             </motion.p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <Card
//                 key={index}
//                 className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <div className="flex items-center gap-2">
//                     <CardTitle className="text-base font-medium">
//                       {block.name}
//                     </CardTitle>
//                     {/* {block.blockType && <BlockTypeBadge type={block.blockType} />} */}
//                     {block.isStandaloneBlock && (
//                       <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                         <Sparkles className="h-3 w-3 mr-1" />
//                         AI Optimized
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <Clock className="h-4 w-4" />
//                     {block.startTime} - {block.endTime}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="pt-2">
//                   {block.tasks.map((task, taskIndex) => (
//                     <motion.div
//                       key={taskIndex}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.3, delay: taskIndex * 0.05 }}
//                       className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                     >
//                       <Checkbox className="flex-shrink-0" disabled />
//                       <span className="text-sm font-medium flex-grow">
//                         {task.name}
//                       </span>
//                       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                         {task.duration}min
//                       </span>
//                       <div
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           task.priority === "High"
//                             ? "bg-red-500"
//                             : task.priority === "Medium"
//                             ? "bg-yellow-500"
//                             : "bg-green-500"
//                         }`}
//                       />
//                     </motion.div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Auth Modal (handles sign in / sign up flows) */}
//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//         actionType={authAction}
//       />
//     </div>
//   );
// };

// export default SchedulePreview;

// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth, UserButton } from "@clerk/nextjs";
// import {
//   Clock,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { format } from "date-fns";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Checkbox } from "@/components/ui/checkbox";
// import AuthModal from "@/dialog/authModal";
// import { useAppContext } from "../context/AppContext";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import MobileNav from "./MobileNav";
// import BlockTypeBadge from "./BlockTypeBadge";

// /* -------------- Interfaces -------------- */
// interface Task {
//   name: string;
//   description: string;
//   duration: number;
//   priority: "High" | "Medium" | "Low";
//   isRoutineTask: boolean;
// }

// interface Block {
//   name: string;
//   startTime: string;
//   endTime: string;
//   description: string;
//   isEvent: boolean;
//   isRoutine: boolean;
//   isStandaloneBlock: boolean;
//   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   energyLevel: "high" | "medium" | "low";
//   tasks: Task[];
// }

// interface Schedule {
//   currentTime: string;
//   scheduleRationale: string;
//   userStartTime: string;
//   userEndTime: string;
//   blocks: Block[];
// }

// interface SchedulePreviewProps {
//   schedule: Schedule;
//   onModify?: () => void;
//   onConfirm?: () => void;
//   title?: string;
//   description?: string;
//   dayId?: string; // Make optional since guest users won't have this
//   userId?: string; // Make optional since guest users won't have this
//   mutate: () => Promise<any>;
//   onGenerateSchedule: () => void;
// }

// /* -------------- Loading Spinner -------------- */
// const LoadingSpinner = () => (
//   <div className="flex-1 flex flex-col items-center justify-center min-h-screen -mt-16">
//     <div className="relative">
//       <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
//       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
//         <div className="flex gap-1">
//           {[...Array(3)].map((_, i) => (
//             <div
//               key={i}
//               className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//               style={{ animationDelay: `${i * 0.15}s` }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//     <p className="mt-12 text-sm text-gray-500">Saving your schedule...</p>
//   </div>
// );

// /* -------------- Schedule Preview -------------- */
// const SchedulePreview: React.FC<SchedulePreviewProps> = ({
//   schedule,
//   dayId,
//   userId,
//   mutate,
//   onGenerateSchedule,
// }) => {
//   const { isSignedIn, isLoaded } = useAuth(); // Auth state
//   const { setIsPreviewMode, setPreviewSchedule, setDay } = useAppContext();

//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
//     "accept"
//   );
//   const [isSaving, setIsSaving] = useState(false);

//   /* -------------- Handlers -------------- */
//   // If user is not signed in, we open the AuthModal. Otherwise, call onGenerateSchedule.
//   const handleRegenerateClick = () => {
//     if (!isSignedIn) {
//       setAuthAction("regenerate");
//       setShowAuthModal(true);
//       return;
//     }
//     onGenerateSchedule();
//   };

//   const handleDiscardClick = () => {
//     localStorage.removeItem("schedule");
//     localStorage.setItem("isPreviewMode", "false");
//     setIsPreviewMode(false);
//     setPreviewSchedule(null);
//   };

//   // Save schedule to DB
//   const handleSaveGeneratedSchedule = async () => {
//     if (!isSignedIn) {
//       setAuthAction("accept");
//       setShowAuthModal(true);
//       return;
//     }

//     if (!dayId || !userId) {
//       toast.error("Missing required information. Please try again.");
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const schedulerResponse = await fetch("/api/scheduler", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           dayId,
//           schedule,
//           userId,
//         }),
//       });

//       if (!schedulerResponse.ok) {
//         throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
//       }

//       const freshDay = await schedulerResponse.json();

//       // Normalize tasks
//       const normalizedDay = {
//         ...freshDay,
//         blocks: freshDay.blocks.map((block: any) => ({
//           ...block,
//           tasks: block.tasks.map((task: any) => ({
//             ...task,
//             block: block._id,
//             blockId: undefined,
//           })),
//         })),
//       };

//       // Update context state
//       setDay(normalizedDay);
//       // Revalidate SWR data
//       mutate();

//       // Exit preview
//       setIsPreviewMode(false);
//       setPreviewSchedule(null);

//       toast.success("Schedule saved successfully!");
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//       toast.error("Failed to save schedule. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   /* -------------- Render -------------- */
//   if (isSaving) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       {/* MOBILE NAV EXAMPLE (optional) */}
//       {/*
//         If you want to keep the mobile nav for small screens, you can uncomment
//         the section below or adjust to your desired layout.
//       */}
//       {/*
//       <div className="md:hidden px-4 py-3 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <div className="w-8">
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 p-0">
//                 <MobileNav />
//               </SheetContent>
//             </Sheet>
//           </div>
//           <div className="text-sm font-medium">
//             {format(new Date(), "MMM d, yyyy")}
//           </div>
//           <div className="w-8">{isSignedIn ? <UserButton /> : null}</div>
//         </div>
//       </div>
//       */}

//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-blue-600">Preview</h1>
//               </div>
//               <div className="flex items-center gap-2">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {format(new Date(), "MMMM d, yyyy")}
//                 </h2>
//                 <span className="text-sm text-gray-600 flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Discard button only if userId present, otherwise optional */}
//               {userId && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="bg-white"
//                   onClick={handleDiscardClick}
//                 >
//                   <X className="h-4 w-4 mr-2" />
//                   Discard
//                 </Button>
//               )}

//               {/* <span className="px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-md">
//                 Preview Mode
//               </span> */}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={handleRegenerateClick}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {/* {block.blockType && <BlockTypeBadge type={block.blockType} />} */}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Auth Modal (handles sign in / sign up flows) */}
//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//         actionType={authAction}
//       />
//     </div>
//   );
// };

// export default SchedulePreview;

// "use Client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth, UserButton } from "@clerk/nextjs";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   ArrowRight,
//   Info,
//   Battery,
//   Zap,
//   Brain,
//   Lightbulb,
//   EyeIcon,
//   Menu,
//   Calendar,
//   MessageSquare,
// } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import AuthModal from "@/dialog/authModal";
// import { useAppContext } from "../context/AppContext";
// import toast from "react-hot-toast";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import MobileNav from "./MobileNav";
// import { format, parseISO, isBefore } from "date-fns";
// import BlockTypeBadge from "./BlockTypeBadge";
// import ScheduleInsights from "./ScheduleInsights"; // Adjust the import path based on your file structure

// // interface Task {
// //   id: string;
// //   name: string;
// //   type?: string;
// //   priority?: "high" | "medium" | "low";
// // }

// interface Block {
//   name: string;
//   startTime: string;
//   endTime: string;
//   description: string;
//   isEvent: boolean;
//   isRoutine: boolean;
//   isStandaloneBlock: boolean;
//   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
//   energyLevel: "high" | "medium" | "low";
//   tasks: Task[];
// }

// interface SchedulePreviewProps {
//   schedule: Schedule;
//   onModify?: () => void;
//   onConfirm?: () => void;
//   title?: string;
//   description?: string;
//   dayId?: string; // Make optional since guest users won't have this
//   userId?: string; // Make optional since guest users won't have this
//   mutate: () => Promise<any>; // Update the type to match SWR's mutate
//   onGenerateSchedule: () => void; // Add this new prop
// }

// interface Schedule {
//   currentTime: string;
//   scheduleRationale: string;
//   userStartTime: string;
//   userEndTime: string;
//   blocks: Block[];
// }

// interface Task {
//   name: string;
//   description: string;
//   duration: number;
//   priority: "High" | "Medium" | "Low";
//   isRoutineTask: boolean;
// }

// // First, let's update the LoadingSpinner component to have proper full-height centering
// const LoadingSpinner = () => (
//   <div className="flex-1 flex flex-col items-center justify-center min-h-screen -mt-16">
//     <div className="relative">
//       <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
//       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
//         <div className="flex gap-1">
//           {[...Array(3)].map((_, i) => (
//             <div
//               key={i}
//               className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//               style={{ animationDelay: `${i * 0.15}s` }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//     <p className="mt-12 text-sm text-gray-500">Saving your schedule...</p>
//   </div>
// );

// const SchedulePreview: React.FC<SchedulePreviewProps> = ({
//   schedule,
//   dayId,
//   userId,
//   mutate,
//   onGenerateSchedule,
// }) => {
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authAction, setAuthAction] = useState<"accept" | "regenerate">(
//     "accept"
//   );
//   const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
//   const { setIsPreviewMode, setPreviewSchedule, setDay } = useAppContext();
//   const { isSignedIn, isLoaded } = useAuth(); // Add this to check auth status
//   const [isSaving, setIsSaving] = useState(false); // Add this state

//   const handleAcceptClick = () => {
//     setAuthAction("accept");
//     setShowAuthModal(true);
//   };

//   console.log(schedule);

//   const handleRegenerateClick = () => {
//     if (!isSignedIn) {
//       setAuthAction("regenerate");
//       setShowAuthModal(true);
//       return;
//     }
//     onGenerateSchedule(); // Call the passed function if user is signed in
//   };

//   // Update the save function to use the loading state:
//   const handleSaveGeneratedSchedule = async () => {
//     if (!isSignedIn) {
//       setAuthAction("accept");
//       setShowAuthModal(true);
//       return;
//     }

//     if (!dayId || !userId) {
//       toast.error("Missing required information. Please try again.");
//       return;
//     }

//     try {
//       setIsSaving(true);
//       console.log("Starting save process...");

//       const schedulerResponse = await fetch("/api/scheduler", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           dayId,
//           schedule,
//           userId,
//         }),
//       });

//       if (!schedulerResponse.ok) {
//         throw new Error(`Scheduler error! status: ${schedulerResponse.status}`);
//       }

//       // Get the updated day data
//       const freshDay = await schedulerResponse.json();

//       // Normalize the data by ensuring all tasks use 'block' instead of 'blockId'
//       const normalizedDay = {
//         ...freshDay,
//         blocks: freshDay.blocks.map((block: any) => ({
//           ...block,
//           tasks: block.tasks.map((task: any) => ({
//             ...task,
//             block: block._id, // Set block to the block's ID
//             blockId: undefined, // Remove blockId field
//           })),
//         })),
//       };

//       console.log(normalizedDay);

//       // First update the state
//       setDay(normalizedDay);

//       // Then trigger a revalidation
//       mutate();

//       // Hide the preview mode
//       setIsPreviewMode(false);
//       setPreviewSchedule(null);

//       toast.success("Schedule saved successfully!");
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//       toast.error("Failed to save schedule. Please try again.");
//     } finally {
//       console.log("Save process complete");
//       setIsSaving(false);
//     }
//   };

//   // Mobile header actions
//   const MobileActions = () => (
//     <div className="md:hidden w-full flex gap-2 mt-4">
//       {userId && (
//         <Button
//           variant="outline"
//           size="sm"
//           className="flex-1 bg-white hover:bg-gray-50 border-gray-200"
//           onClick={() => {
//             localStorage.removeItem("schedule");
//             localStorage.setItem("isPreviewMode", "false");
//             setIsPreviewMode(false);
//             setPreviewSchedule(null);
//           }}
//         >
//           <X className="h-4 w-4 mr-2" />
//           Discard
//         </Button>
//       )}
//       <Button
//         variant="outline"
//         size="sm"
//         className="flex-1 bg-white hover:bg-gray-50 border-gray-200"
//         onClick={handleRegenerateClick}
//       >
//         <RotateCcw className="h-4 w-4 mr-2" />
//         Regenerate
//       </Button>
//       <Button
//         size="sm"
//         className="flex-1 bg-blue-600 hover:bg-blue-700"
//         onClick={handleSaveGeneratedSchedule}
//       >
//         <Check className="h-4 w-4 mr-2" />
//         Apply
//       </Button>
//     </div>
//   );

//   // Desktop header actions
//   const DesktopActions = () => (
//     <div className="hidden md:flex items-center gap-3">
//       {userId && (
//         <Button
//           variant="outline"
//           size="default"
//           className="bg-white hover:bg-gray-50 border-gray-200"
//           onClick={() => {
//             localStorage.removeItem("schedule");
//             localStorage.setItem("isPreviewMode", "false");
//             setIsPreviewMode(false);
//             setPreviewSchedule(null);
//           }}
//         >
//           <X className="h-4 w-4 mr-2" />
//           Discard
//         </Button>
//       )}
//       <Button
//         variant="outline"
//         size="default"
//         className="bg-white hover:bg-gray-50 border-gray-200"
//         onClick={handleRegenerateClick}
//       >
//         <RotateCcw className="h-4 w-4 mr-2" />
//         Regenerate
//       </Button>
//       <Button
//         size="default"
//         className="bg-blue-600 hover:bg-blue-700"
//         onClick={handleSaveGeneratedSchedule}
//       >
//         <Check className="h-4 w-4 mr-2" />
//         Apply Schedule
//       </Button>
//     </div>
//   );

//   const insights = schedule.scheduleRationale
//     .split(".")
//     .filter(Boolean)
//     .slice(0, 3)
//     .map((insight) => insight.trim());

//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       {isSaving ? (
//         <LoadingSpinner />
//       ) : (
//         <div className="space-y-6">
//           <div className="md:hidden px-4 py-3 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               {/* Left: Menu Button - Always present */}
//               <div className="w-8">
//                 {" "}
//                 {/* Fixed width container */}
//                 <Sheet>
//                   <SheetTrigger asChild>
//                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                       <Menu className="h-5 w-5" />
//                     </Button>
//                   </SheetTrigger>
//                   <SheetContent side="left" className="w-64 p-0">
//                     <MobileNav />
//                   </SheetContent>
//                 </Sheet>
//               </div>

//               {/* Center: Date display - Always present */}
//               <div className="text-sm font-medium">
//                 {format(new Date(), "MMM d, yyyy")}
//               </div>

//               {/* Right: User button or placeholder - Always same width */}
//               <div className="w-8">
//                 {" "}
//                 {/* Fixed width container */}
//                 {isSignedIn ? <UserButton /> : <div className="h-8" />}
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             {/* Large Date Display */}
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className="bg-blue-600/10 p-2.5 rounded-xl">
//                   <Sparkles className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//                     Jan 23
//                   </h2>
//                   <p className="text-lg text-gray-600">
//                     {schedule.userStartTime} - {schedule.userEndTime}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//                   Preview Mode
//                 </span>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//               <div className="p-6">
//                 <div className="flex items-start gap-3 mb-4">
//                   <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-2">
//                       AI Assistant Recommendations
//                     </h3>
//                     <p className="text-gray-700 text-base leading-relaxed">
//                       {schedule.scheduleRationale}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="border-t border-gray-100 bg-gray-50/80 p-4 flex justify-end gap-3">
//                 <DesktopActions />
//               </div>
//             </div>
//           </div>
//           {/* <Card className="border-blue-100">
//             <CardHeader className="pb-4">
//               <div className="flex flex-col space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Sparkles className="h-5 w-5 text-blue-600" />
//                     <CardTitle className="text-lg md:text-xl font-semibold">
//                       AI Generated Schedule
//                     </CardTitle>
//                     <span className="hidden md:inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
//                       Preview Mode
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4 text-sm">
//                   <div className="flex items-center text-gray-600">
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Thursday, January 23rd, 2025
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <Clock className="h-4 w-4 mr-2" />
//                     {schedule.userStartTime} - {schedule.userEndTime}
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div className="prose prose-sm max-w-none">
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-gray-600 whitespace-pre-wrap">
//                       {schedule.scheduleRationale}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3">
//                   <DesktopActions />
//                 </div>
//               </div>
//             </CardContent>
//           </Card> */}

//           {/* <Card className="border-blue-100">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <EyeIcon className="h-5 w-5 text-blue-600" />
//                   <CardTitle className="text-lg md:text-xl font-semibold">
//                     Schedule Preview
//                   </CardTitle>
//                   <span className="hidden md:inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
//                     Draft Mode
//                   </span>
//                 </div>
//                 <DesktopActions />
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {schedule.userStartTime} - {schedule.userEndTime}
//               </p>
//             </CardHeader>
//             <CardContent className="text-sm text-gray-600 space-y-2">
//               <ScheduleInsights
//                 insights={schedule.scheduleRationale
//                   .split(".")
//                   .filter(Boolean)
//                   .slice(0, 3)
//                   .map((insight) => insight.trim())}
//               />
//               {/* <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <Battery className="h-4 w-4 text-green-600 flex-shrink-0" />
//                   <span className="line-clamp-2">{insights[0]}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />
//                   <span className="line-clamp-2">{insights[1]}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Brain className="h-4 w-4 text-purple-600 flex-shrink-0" />
//                   <span className="line-clamp-2">{insights[2]}</span>
//                 </div>
//               </div> */}
//           {/* </CardContent>
//           </Card> */}
//           <MobileActions />
//           {/* Rest of the schedule blocks code remains the same */}
//           <div className="space-y-4">
//             {schedule.blocks.map((block, index) => (
//               <Card key={index} className="border-gray-200 shadow-sm">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-base font-medium">
//                     <div className="flex items-center gap-2">
//                       {block.name}
//                       {block.blockType && (
//                         <BlockTypeBadge type={block.blockType} />
//                       )}
//                       {block.isStandaloneBlock && (
//                         <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
//                           <Sparkles className="mr-1 h-3 w-3" />
//                           <span className="hidden md:inline">AI Optimized</span>
//                           <span className="md:hidden">AI</span>
//                         </span>
//                       )}
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger>
//                             <Info className="h-4 w-4 text-gray-400" />
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p className="max-w-xs">{block.description}</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </CardTitle>
//                   <div className="flex items-center space-x-2">
//                     <div className="flex items-center text-sm text-gray-500">
//                       <Clock className="mr-1.5 h-3.5 w-3.5" />
//                       {block.startTime} - {block.endTime}
//                     </div>
//                     <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
//                       <MoreVertical className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   {block.tasks.map((task, taskIndex) => (
//                     <Card
//                       key={taskIndex}
//                       className="mb-3 border-gray-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
//                     >
//                       <CardContent className="p-4">
//                         <div className="flex items-center space-x-4">
//                           <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
//                           <Checkbox className="flex-shrink-0 mt-0.5" disabled />
//                           <div className="flex-grow min-w-0">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2 min-w-0">
//                                 <span className="text-sm font-medium text-gray-900 truncate leading-none pt-0.5">
//                                   {task.name}
//                                 </span>
//                                 <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex-shrink-0">
//                                   {task.duration}min
//                                 </span>
//                                 <TooltipProvider>
//                                   <Tooltip>
//                                     <TooltipTrigger>
//                                       <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 flex-shrink-0">
//                                         {block.blockType}
//                                       </span>
//                                     </TooltipTrigger>
//                                     <TooltipContent>
//                                       <p className="max-w-xs">
//                                         {task.description}
//                                       </p>
//                                     </TooltipContent>
//                                   </Tooltip>
//                                 </TooltipProvider>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                       <div
//                         className={`absolute top-0 right-0 bottom-0 w-1 ${
//                           task.priority === "High"
//                             ? "bg-red-500"
//                             : task.priority === "Medium"
//                             ? "bg-yellow-500"
//                             : "bg-green-500"
//                         }`}
//                         aria-label="Priority Indicator"
//                       />
//                     </Card>
//                   ))}
//                   <div className="flex justify-between items-center mt-4">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="h-8 text-sm text-gray-400 cursor-not-allowed"
//                       disabled
//                     >
//                       Add Task
//                     </Button>
//                     <div className="space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="h-8 text-sm text-gray-400 cursor-not-allowed"
//                         disabled
//                       >
//                         <Check className="h-4 w-4 mr-1" />
//                         Complete
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="h-8 text-sm text-gray-400 cursor-not-allowed"
//                         disabled
//                       >
//                         <Clock className="h-4 w-4 mr-1" />
//                         Start
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}
//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//         actionType={authAction}
//       />
//     </div>
//   );
// };

// export default SchedulePreview;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
//   Menu,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const SchedulePreview = ({
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-600/10 p-2.5 rounded-lg">
//               {/* <Sparkles className="h-5 w-5 text-blue-600" /> */}
//               Preview Schedule
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {format(new Date(), "MMM d")}
//               </h2>
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Clock className="h-4 w-4" />
//                 <span>
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//               Preview Mode
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {block.blockType && <BlockTypeBadge type={block.blockType} />}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchedulePreview;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
//   Menu,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const SchedulePreview = ({
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="space-y-6">
//         {/* Header Section */}
//         <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-600/10 p-2.5 rounded-lg">
//               Preview Schedule
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {format(new Date(), "MMM d")}
//               </h2>
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Clock className="h-4 w-4" />
//                 <span>
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//               Preview Mode
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {block.blockType && <BlockTypeBadge type={block.blockType} />}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchedulePreview;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Clock,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
// } from "lucide-react";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";

// const SchedulePreviewDialog = ({
//   isOpen,
//   onClose,
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
//         <DialogHeader className="px-6 py-4 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <DialogTitle className="text-xl font-semibold">
//                 Schedule Preview
//               </DialogTitle>
//               <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//                 Preview Mode
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={onGenerateSchedule}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="space-y-6">
//             {/* Date and Time Header */}
//             <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center gap-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {format(new Date(), "MMM d")}
//                   </h2>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Clock className="h-4 w-4" />
//                     <span>
//                       {schedule.userStartTime} - {schedule.userEndTime}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* AI Insights */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <div className="flex items-start gap-3">
//                 <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   {schedule.scheduleRationale}
//                 </p>
//               </div>
//             </div>

//             {/* Schedule Blocks */}
//             <div className="space-y-4">
//               {schedule.blocks.map((block, index) => (
//                 <Card
//                   key={index}
//                   className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <div className="flex items-center gap-2">
//                       <CardTitle className="text-base font-medium">
//                         {block.name}
//                       </CardTitle>
//                       {block.blockType && (
//                         <BlockTypeBadge type={block.blockType} />
//                       )}
//                       {block.isStandaloneBlock && (
//                         <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                           <Sparkles className="h-3 w-3 mr-1" />
//                           AI Optimized
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                       <Clock className="h-4 w-4" />
//                       {block.startTime} - {block.endTime}
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-2">
//                     {block.tasks.map((task, taskIndex) => (
//                       <div
//                         key={taskIndex}
//                         className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                       >
//                         <Checkbox className="flex-shrink-0" disabled />
//                         <span className="text-sm font-medium flex-grow">
//                           {task.name}
//                         </span>
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                           {task.duration}min
//                         </span>
//                         <div
//                           className={`w-1.5 h-1.5 rounded-full ${
//                             task.priority === "High"
//                               ? "bg-red-500"
//                               : task.priority === "Medium"
//                               ? "bg-yellow-500"
//                               : "bg-green-500"
//                           }`}
//                         />
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SchedulePreviewDialog;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Clock,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
// } from "lucide-react";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";

// const SchedulePreviewDialog = ({
//   isOpen,
//   onClose,
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
//         <DialogHeader className="px-6 py-4 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <DialogTitle className="text-xl font-semibold">
//                 Schedule Preview
//               </DialogTitle>
//               <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//                 Preview Mode
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={onGenerateSchedule}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="space-y-6">
//             {/* Date and Time Header */}
//             <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center gap-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {format(new Date(), "MMM d")}
//                   </h2>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Clock className="h-4 w-4" />
//                     <span>
//                       {schedule.userStartTime} - {schedule.userEndTime}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* AI Insights */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <div className="flex items-start gap-3">
//                 <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   {schedule.scheduleRationale}
//                 </p>
//               </div>
//             </div>

//             {/* Schedule Blocks */}
//             <div className="space-y-4">
//               {schedule.blocks.map((block, index) => (
//                 <Card
//                   key={index}
//                   className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <div className="flex items-center gap-2">
//                       <CardTitle className="text-base font-medium">
//                         {block.name}
//                       </CardTitle>
//                       {block.blockType && (
//                         <BlockTypeBadge type={block.blockType} />
//                       )}
//                       {block.isStandaloneBlock && (
//                         <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                           <Sparkles className="h-3 w-3 mr-1" />
//                           AI Optimized
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                       <Clock className="h-4 w-4" />
//                       {block.startTime} - {block.endTime}
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-2">
//                     {block.tasks.map((task, taskIndex) => (
//                       <div
//                         key={taskIndex}
//                         className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                       >
//                         <Checkbox className="flex-shrink-0" disabled />
//                         <span className="text-sm font-medium flex-grow">
//                           {task.name}
//                         </span>
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                           {task.duration}min
//                         </span>
//                         <div
//                           className={`w-1.5 h-1.5 rounded-full ${
//                             task.priority === "High"
//                               ? "bg-red-500"
//                               : task.priority === "Medium"
//                               ? "bg-yellow-500"
//                               : "bg-green-500"
//                           }`}
//                         />
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SchedulePreviewDialog;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Clock, Check, Sparkles, RotateCcw, MessageSquare } from "lucide-react";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";

// const SchedulePreviewDialog = ({
//   isOpen,
//   onClose,
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
//         <DialogHeader className="px-6 py-4 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <DialogTitle className="text-xl font-semibold">
//                 Schedule Preview
//               </DialogTitle>
//               <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//                 Preview Mode
//               </span>
//             </div>
//             <div className="flex items-center gap-4">
//               <Clock className="h-4 w-4 text-gray-500" />
//               <span className="text-sm text-gray-600">
//                 {schedule.userStartTime} - {schedule.userEndTime}
//               </span>
//               <span className="text-2xl font-bold text-gray-900">
//                 {format(new Date(), "MMM d")}
//               </span>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="space-y-6">
//             {/* AI Insights */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <div className="flex items-start gap-3">
//                 <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   {schedule.scheduleRationale}
//                 </p>
//               </div>
//             </div>

//             {/* Schedule Blocks */}
//             <div className="space-y-4">
//               {schedule.blocks.map((block, index) => (
//                 <Card
//                   key={index}
//                   className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <div className="flex items-center gap-2">
//                       <CardTitle className="text-base font-medium">
//                         {block.name}
//                       </CardTitle>
//                       {block.blockType && (
//                         <BlockTypeBadge type={block.blockType} />
//                       )}
//                       {block.isStandaloneBlock && (
//                         <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                           <Sparkles className="h-3 w-3 mr-1" />
//                           AI Optimized
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                       <Clock className="h-4 w-4" />
//                       {block.startTime} - {block.endTime}
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-2">
//                     {block.tasks.map((task, taskIndex) => (
//                       <div
//                         key={taskIndex}
//                         className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                       >
//                         <Checkbox className="flex-shrink-0" disabled />
//                         <span className="text-sm font-medium flex-grow">
//                           {task.name}
//                         </span>
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                           {task.duration}min
//                         </span>
//                         <div
//                           className={`w-1.5 h-1.5 rounded-full ${
//                             task.priority === "High"
//                               ? "bg-red-500"
//                               : task.priority === "Medium"
//                               ? "bg-yellow-500"
//                               : "bg-green-500"
//                           }`}
//                         />
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="px-6 py-4 border-t">
//           <div className="flex items-center gap-2 w-full justify-end">
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SchedulePreviewDialog;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Clock,
//   Check,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
// } from "lucide-react";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// const SchedulePreviewDialog = ({
//   isOpen,
//   onClose,
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
//         <DialogHeader className="px-8 py-6 border-b">
//           <div className="flex flex-col gap-4">
//             <div className="flex items-start justify-between">
//               <div className="flex flex-col gap-2">
//                 <DialogTitle className="text-2xl font-semibold">
//                   Schedule Preview
//                 </DialogTitle>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <Calendar className="h-4 w-4" />
//                     <span className="font-medium">
//                       {format(new Date(), "MMMM d, yyyy")}
//                     </span>
//                   </div>
//                   <Separator orientation="vertical" className="h-4" />
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <Clock className="h-4 w-4" />
//                     <span>
//                       {schedule.userStartTime} - {schedule.userEndTime}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <Badge variant="secondary" className="h-fit">
//                 Preview Mode
//               </Badge>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="space-y-6">
//             {/* AI Insights */}
//             {/* <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <div className="flex items-start gap-3">
//                 <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   {schedule.scheduleRationale}
//                 </p>
//               </div>
//             </div> */}

//             {/* Schedule Blocks */}
//             <div className="space-y-4">
//               {schedule.blocks.map((block, index) => (
//                 <Card
//                   key={index}
//                   className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <div className="flex items-center gap-2">
//                       <CardTitle className="text-base font-medium">
//                         {block.name}
//                       </CardTitle>
//                       {block.blockType && (
//                         <BlockTypeBadge type={block.blockType} />
//                       )}
//                       {block.isStandaloneBlock && (
//                         <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                           <Sparkles className="h-3 w-3 mr-1" />
//                           AI Optimized
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                       <Clock className="h-4 w-4" />
//                       {block.startTime} - {block.endTime}
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-2">
//                     {block.tasks.map((task, taskIndex) => (
//                       <div
//                         key={taskIndex}
//                         className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                       >
//                         <Checkbox className="flex-shrink-0" disabled />
//                         <span className="text-sm font-medium flex-grow">
//                           {task.name}
//                         </span>
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                           {task.duration}min
//                         </span>
//                         <div
//                           className={`w-1.5 h-1.5 rounded-full ${
//                             task.priority === "High"
//                               ? "bg-red-500"
//                               : task.priority === "Medium"
//                               ? "bg-yellow-500"
//                               : "bg-green-500"
//                           }`}
//                         />
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="px-6 py-4 border-t">
//           <div className="flex items-center gap-2 w-full justify-end">
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SchedulePreviewDialog;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
//   Menu,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const SchedulePreview = ({
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-600/10 p-2.5 rounded-lg">
//               {/* <Sparkles className="h-5 w-5 text-blue-600" /> */}
//               Preview Schedule
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {format(new Date(), "MMM d")}
//               </h2>
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Clock className="h-4 w-4" />
//                 <span>
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <span className="px-2.5 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md">
//               Preview Mode
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {block.blockType && <BlockTypeBadge type={block.blockType} />}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchedulePreview;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
//   Menu,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const SchedulePreview = ({
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//           <div className="flex flex-col items-center gap-2 mb-4">
//             <div className="flex items-center gap-2">
//               <Sparkles className="h-5 w-5 text-blue-600" />
//               <h1 className="text-lg font-semibold text-blue-600">
//                 Schedule Preview
//               </h1>
//             </div>
//             <div className="text-center">
//               <h2 className="text-3xl font-bold text-gray-900">
//                 {format(new Date(), "MMMM d, yyyy")}
//               </h2>
//               <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
//                 <Clock className="h-4 w-4" />
//                 <span>
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center justify-end gap-3 border-t pt-4">
//             <span className="px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-md">
//               Preview Mode
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-white"
//               onClick={onGenerateSchedule}
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Regenerate
//             </Button>
//             <Button
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleSaveGeneratedSchedule}
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Apply Schedule
//             </Button>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {block.blockType && <BlockTypeBadge type={block.blockType} />}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchedulePreview;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Clock,
//   Plus,
//   AlertCircle,
//   MoreVertical,
//   GripVertical,
//   Check,
//   X,
//   Sparkles,
//   RotateCcw,
//   MessageSquare,
//   Calendar,
//   Menu,
// } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import BlockTypeBadge from "./BlockTypeBadge";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const SchedulePreview = ({
//   schedule,
//   onGenerateSchedule,
//   handleSaveGeneratedSchedule,
// }) => {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 h-full">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-blue-600">Preview</h1>
//               </div>
//               <div className="flex items-center gap-2">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {format(new Date(), "MMMM d, yyyy")}
//                 </h2>
//                 <span className="text-sm text-gray-600 flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {schedule.userStartTime} - {schedule.userEndTime}
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-md">
//                 Preview Mode
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-white"
//                 onClick={onGenerateSchedule}
//               >
//                 <RotateCcw className="h-4 w-4 mr-2" />
//                 Regenerate
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={handleSaveGeneratedSchedule}
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Apply Schedule
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* AI Insights Card */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
//           <div className="flex items-start gap-3">
//             <MessageSquare className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
//             <p className="text-sm text-gray-600 leading-relaxed">
//               {schedule.scheduleRationale}
//             </p>
//           </div>
//         </div>

//         {/* Schedule Blocks */}
//         <div className="space-y-4">
//           {schedule.blocks.map((block, index) => (
//             <Card
//               key={index}
//               className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center gap-2">
//                   <CardTitle className="text-base font-medium">
//                     {block.name}
//                   </CardTitle>
//                   {block.blockType && <BlockTypeBadge type={block.blockType} />}
//                   {block.isStandaloneBlock && (
//                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
//                       <Sparkles className="h-3 w-3 mr-1" />
//                       AI Optimized
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   {block.startTime} - {block.endTime}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 {block.tasks.map((task, taskIndex) => (
//                   <div
//                     key={taskIndex}
//                     className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3"
//                   >
//                     <Checkbox className="flex-shrink-0" disabled />
//                     <span className="text-sm font-medium flex-grow">
//                       {task.name}
//                     </span>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       {task.duration}min
//                     </span>
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         task.priority === "High"
//                           ? "bg-red-500"
//                           : task.priority === "Medium"
//                           ? "bg-yellow-500"
//                           : "bg-green-500"
//                       }`}
//                     />
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchedulePreview;
