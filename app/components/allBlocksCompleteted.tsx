// // // // export default AllBlocksCompleted;
// // // import { Button } from "@/components/ui/button";
// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import {
// // //   Collapsible,
// // //   CollapsibleContent,
// // //   CollapsibleTrigger,
// // // } from "@/components/ui/collapsible";
// // // import { Progress } from "@/components/ui/progress";
// // // import { Separator } from "@/components/ui/separator";
// // // import {
// // //   AlertCircle,
// // //   CheckCircle,
// // //   ChevronDown,
// // //   Clock,
// // //   Target,
// // //   BarChart2,
// // //   ListTodo,
// // //   ChevronUp,
// // //   ChevronRight,
// // //   X,
// // //   Percent,
// // //   LayoutDashboard,
// // // } from "lucide-react";
// // // import React, { useState } from "react";

// // // interface Task {
// // //   _id: string;
// // //   blockId: string;
// // //   dayId: string;
// // //   name: string;
// // //   description: string;
// // //   duration: string;
// // //   priority: "High" | "Medium" | "Low";
// // //   status: "pending" | "in_progress" | "completed";
// // //   type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
// // //   isRoutineTask: boolean;
// // //   completed: boolean;
// // //   createdAt: string;
// // //   updatedAt: string;
// // //   __v: number;
// // // }

// // // // Types shared between components
// // // export interface Block {
// // //   _id: string;
// // //   dayId: string;
// // //   name: string;
// // //   description: string;
// // //   startTime: string;
// // //   endTime: string;
// // //   status: "pending" | "complete" | "incomplete";
// // //   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
// // //   event: string | null;
// // //   tasks: Task[];
// // //   createdAt: string;
// // //   updatedAt: string;
// // //   __v: number;
// // //   isStandaloneBlock?: boolean;
// // //   meetingLink: string;
// // // }

// // // interface PerformanceRating {
// // //   level: string;
// // //   score: number;
// // //   comment: string;
// // // }

// // // interface AllBlocksCompletedProps {
// // //   onCompleteDay: () => void;
// // //   onAddNewBlock: () => void;
// // //   blocks?: Block[];
// // // }

// // // const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
// // //   onCompleteDay,
// // //   onAddNewBlock,
// // //   blocks = [],
// // // }) => {
// // //   return (
// // //     <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white">
// // //       <CardContent className="flex flex-col items-center justify-center h-full p-6 space-y-8">
// // //         {/* Celebration Icon */}
// // //         <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
// // //           <CheckCircle className="h-12 w-12 text-blue-600" />
// // //         </div>

// // //         {/* Message */}
// // //         <div className="text-center space-y-2">
// // //           <h2 className="text-2xl font-semibold text-gray-900">
// // //             All Blocks Completed!
// // //           </h2>
// // //           <p className="text-gray-500 max-w-md">
// // //             {
// // //               "Great work! You've completed all your scheduled blocks for today. Would you like to end your day or add more blocks?"
// // //             }
// // //           </p>
// // //         </div>

// // //         {/* Action Buttons */}
// // //         <div className="flex items-center gap-4">
// // //           <Button
// // //             variant="outline"
// // //             onClick={onAddNewBlock}
// // //             className="min-w-[140px] border-gray-200 hover:bg-gray-50 hover:border-gray-300"
// // //           >
// // //             Add More Blocks
// // //           </Button>
// // //           <Button
// // //             onClick={onCompleteDay}
// // //             className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
// // //           >
// // //             Complete Day
// // //           </Button>
// // //         </div>
// // //       </CardContent>
// // //     </Card>
// // //   );
// // // };

// // // export default AllBlocksCompleted;

// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import {
// //   Collapsible,
// //   CollapsibleContent,
// //   CollapsibleTrigger,
// // } from "@/components/ui/collapsible";
// // import { Progress } from "@/components/ui/progress";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   AlertCircle,
// //   CheckCircle,
// //   ChevronDown,
// //   Clock,
// //   Target,
// //   BarChart2,
// //   ListTodo,
// //   ChevronUp,
// //   ChevronRight,
// //   X,
// //   Percent,
// //   LayoutDashboard,
// // } from "lucide-react";
// // import React, { useState } from "react";

// // interface Task {
// //   _id: string;
// //   blockId: string;
// //   dayId: string;
// //   name: string;
// //   description: string;
// //   duration: string;
// //   priority: "High" | "Medium" | "Low";
// //   status: "pending" | "in_progress" | "completed";
// //   type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
// //   isRoutineTask: boolean;
// //   completed: boolean;
// //   createdAt: string;
// //   updatedAt: string;
// //   __v: number;
// // }

// // // Types shared between components
// // export interface Block {
// //   _id: string;
// //   dayId: string;
// //   name: string;
// //   description: string;
// //   startTime: string;
// //   endTime: string;
// //   status: "pending" | "complete" | "incomplete";
// //   blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
// //   event: string | null;
// //   tasks: Task[];
// //   createdAt: string;
// //   updatedAt: string;
// //   __v: number;
// //   isStandaloneBlock?: boolean;
// //   meetingLink: string;
// // }

// // interface PerformanceRating {
// //   level: string;
// //   score: number;
// //   comment: string;
// // }

// // interface AllBlocksCompletedProps {
// //   onCompleteDay: () => void;
// //   onAddNewBlock: () => void;
// //   blocks?: Block[];
// // }

// // const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
// //   onCompleteDay,
// //   onAddNewBlock,
// //   blocks = [],
// // }) => {
// //   return (
// //     <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white relative overflow-hidden">
// //       {/* Top accent bar similar to CompletedDayView */}
// //       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400"></div>

// //       <CardContent className="flex flex-col items-center justify-center h-full p-6 md:p-8 space-y-8">
// //         {/* Celebration Icon - Enhanced styling */}
// //         <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
// //           <CheckCircle className="h-12 w-12 text-blue-600" />
// //         </div>

// //         {/* Message - Improved typography and spacing */}
// //         <div className="text-center space-y-3 max-w-md">
// //           <h2 className="text-2xl font-bold text-gray-900">
// //             All Blocks Completed!
// //           </h2>
// //           <p className="text-gray-600 leading-relaxed">
// //             Great work! You've completed all your scheduled blocks for today.
// //             Would you like to end your day or add more blocks?
// //           </p>

// //           {/* Subtle separator for visual interest */}
// //           <div className="w-24 h-1 bg-gray-100 mx-auto my-2 rounded-full"></div>
// //         </div>

// //         {/* Action Buttons - Enhanced styling */}
// //         <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
// //           <Button
// //             variant="outline"
// //             onClick={onAddNewBlock}
// //             className="min-w-[140px] w-full sm:w-auto border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
// //             size="lg"
// //           >
// //             <LayoutDashboard className="h-4 w-4 mr-2" />
// //             Add More Blocks
// //           </Button>
// //           <Button
// //             onClick={onCompleteDay}
// //             className="min-w-[140px] w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
// //             size="lg"
// //           >
// //             <CheckCircle className="h-4 w-4 mr-2" />
// //             Complete Day
// //           </Button>
// //         </div>

// //         {/* Subtle decorative element at bottom */}
// //         <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none opacity-10">
// //           <div className="w-64 h-64 rounded-full bg-blue-200 blur-3xl"></div>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default AllBlocksCompleted;

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import {
//   AlertCircle,
//   CheckCircle,
//   ChevronDown,
//   Clock,
//   Target,
//   BarChart2,
//   ListTodo,
//   ChevronUp,
//   ChevronRight,
//   X,
//   Percent,
//   LayoutDashboard,
// } from "lucide-react";
// import React, { useState } from "react";

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
//   __v: number;
// }

// // Types shared between components
// export interface Block {
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
//   __v: number;
//   isStandaloneBlock?: boolean;
//   meetingLink: string;
// }

// interface PerformanceRating {
//   level: string;
//   score: number;
//   comment: string;
// }

// interface AllBlocksCompletedProps {
//   onCompleteDay: () => void;
//   onAddNewBlock: () => void;
//   blocks?: Block[];
// }

// const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
//   onCompleteDay,
//   onAddNewBlock,
//   blocks = [],
// }) => {
//   return (
//     <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white relative overflow-hidden">
//       {/* Premium top accent and subtle background pattern */}
//       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

//       {/* Subtle background pattern */}
//       <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1))] dark:bg-grid-slate-700/25 pointer-events-none"></div>

//       <CardContent className="flex flex-col items-center justify-center h-full p-6 md:p-10 space-y-10 relative z-10">
//         {/* Improved celebration icon with layered design */}
//         <div className="relative">
//           <div className="absolute inset-0 rounded-full bg-blue-600 blur-md opacity-20 scale-110"></div>
//           <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center shadow-lg border border-blue-100/50">
//             <div className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm"></div>
//             <CheckCircle className="h-12 w-12 text-blue-600 relative z-10 drop-shadow-sm" />
//           </div>
//         </div>

//         {/* Enhanced message with better typography */}
//         <div className="text-center space-y-4 max-w-md">
//           <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
//             All Blocks Completed!
//           </h2>
//           <p className="text-gray-600 leading-relaxed text-lg font-normal">
//             Great work! You've completed all your scheduled blocks for today.
//             Would you like to end your day or add more blocks?
//           </p>
//         </div>

//         {/* Refined action buttons */}
//         <div className="flex flex-col sm:flex-row items-center gap-5 w-full max-w-md pt-4">
//           <Button
//             variant="outline"
//             onClick={onAddNewBlock}
//             className="min-w-[160px] w-full sm:w-auto border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
//             size="lg"
//           >
//             <LayoutDashboard className="h-5 w-5 mr-2 text-blue-500" />
//             <span className="font-medium">Add More Blocks</span>
//           </Button>
//           <Button
//             onClick={onCompleteDay}
//             className="min-w-[160px] w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
//             size="lg"
//           >
//             <CheckCircle className="h-5 w-5 mr-2" />
//             <span className="font-medium">Complete Day</span>
//           </Button>
//         </div>

//         {/* Enhanced decorative elements */}
//         <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none"></div>
//         <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>
//         <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none"></div>
//       </CardContent>
//     </Card>
//   );
// };

// export default AllBlocksCompleted;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Target,
  BarChart2,
  ListTodo,
  ChevronUp,
  ChevronRight,
  X,
  Percent,
  LayoutDashboard,
} from "lucide-react";
import React, { useState } from "react";

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

// Types shared between components
export interface Block {
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
  __v: number;
  isStandaloneBlock?: boolean;
  meetingLink: string;
}

interface PerformanceRating {
  level: string;
  score: number;
  comment: string;
}

interface AllBlocksCompletedProps {
  onCompleteDay: () => void;
  onAddNewBlock: () => void;
  blocks?: Block[];
}

const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
  onCompleteDay,
  onAddNewBlock,
  blocks = [],
}) => {
  return (
    <Card className="h-[calc(100vh-13rem)] flex flex-col border border-gray-200 shadow-sm bg-white relative overflow-hidden">
      {/* Premium top accent and subtle background pattern */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1))] dark:bg-grid-slate-700/25 pointer-events-none"></div>

      <CardContent className="flex flex-col items-center justify-center h-full p-6 md:p-10 space-y-10 relative z-10">
        {/* Improved celebration icon with layered design */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-600 blur-md opacity-20 scale-110"></div>
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center shadow-lg border border-blue-100/50">
            <div className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm"></div>
            <CheckCircle className="h-12 w-12 text-blue-600 relative z-10 drop-shadow-sm" />
          </div>
        </div>

        {/* Enhanced message with better typography */}
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            All Blocks Completed!
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg font-normal">
            {
              "Great work! You've completed all your scheduled blocks for today. Would you like to end your day or add more blocks?"
            }
          </p>
        </div>

        {/* Single centered action button */}
        <div className="flex items-center justify-center w-full pt-4">
          <Button
            onClick={onCompleteDay}
            className="min-w-[200px] px-8 bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Complete Day</span>
          </Button>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none"></div>
      </CardContent>
    </Card>
  );
};

export default AllBlocksCompleted;
