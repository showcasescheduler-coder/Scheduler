// // import React from "react";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { PlusCircle, Sparkles, ArrowRight } from "lucide-react";

// // interface NoBlocksCardProps {
// //   activeTab: "active" | "completed";
// //   onGenerateSchedule: () => void;
// //   onAddBlock: () => void;
// // }

// // const NoBlocksCard = ({
// //   activeTab,
// //   onGenerateSchedule,
// //   onAddBlock,
// // }: NoBlocksCardProps) => {
// //   return (
// //     <div className="h-full min-h-[600px] w-full">
// //       <Card className="flex h-full w-full flex-col bg-white">
// //         {activeTab === "active" ? (
// //           <div className="flex h-full flex-col">
// //             {/* Timeline Preview */}
// //             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/50 px-6 py-12">
// //               {/* Decorative elements */}
// //               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/50 blur-3xl"></div>
// //               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/50 blur-3xl"></div>

// //               {/* Timeline visualization */}
// //               <div className="relative mx-auto w-full max-w-2xl">
// //                 <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-100"></div>

// //                 {/* Sample time blocks - these are decorative */}
// //                 <div className="relative flex justify-between py-16">
// //                   {[0, 1, 2].map((i) => (
// //                     <div
// //                       key={i}
// //                       className="group relative flex w-1/3 cursor-pointer flex-col items-center px-4 transition-all hover:-translate-y-1"
// //                       onClick={onAddBlock}
// //                     >
// //                       <div className="mb-3 h-24 w-full transform rounded-lg border-2 border-dashed border-gray-200 bg-white p-3 shadow-sm transition-all group-hover:border-blue-200 group-hover:shadow-md">
// //                         <div className="h-2 w-16 rounded bg-gray-100 group-hover:bg-blue-100"></div>
// //                         <div className="mt-2 h-2 w-24 rounded bg-gray-100 group-hover:bg-blue-100"></div>
// //                       </div>
// //                       <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-gray-100 text-gray-400 shadow-sm transition-all group-hover:bg-blue-500 group-hover:text-white">
// //                         <PlusCircle className="h-5 w-5" />
// //                       </div>
// //                       <div className="absolute -bottom-8 text-sm font-medium text-gray-500">
// //                         {["Morning", "Afternoon", "Evening"][i]}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               {/* Call to action */}
// //               <div className="mt-16 text-center">
// //                 <h3 className="mb-6 text-2xl font-bold text-gray-900">
// //                   Design Your Perfect Day
// //                 </h3>
// //                 <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
// //                   <Button
// //                     onClick={onGenerateSchedule}
// //                     size="lg"
// //                     className="bg-blue-600 px-8 hover:bg-blue-700 hover:shadow-md"
// //                   >
// //                     <Sparkles className="mr-2 h-5 w-5" />
// //                     Generate Smart Schedule
// //                   </Button>
// //                   <Button
// //                     variant="outline"
// //                     size="lg"
// //                     onClick={onAddBlock}
// //                     className="group border-2 border-gray-200 px-8 hover:border-blue-200 hover:bg-blue-50"
// //                   >
// //                     Create First Block
// //                     <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
// //                   </Button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           // Completed tab empty state
// //           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
// //             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
// //             <h3 className="mb-3 text-xl font-semibold text-gray-900">
// //               No Completed Blocks Yet
// //             </h3>
// //             <p className="text-gray-600">
// //               Your completed blocks will appear here. Keep track of your
// //               progress and celebrate your accomplishments as you finish tasks
// //               throughout the day.
// //             </p>
// //             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
// //           </div>
// //         )}
// //       </Card>
// //     </div>
// //   );
// // };

// // export default NoBlocksCard;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Sparkles,
//   Command,
//   BookTemplate,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void; // New
//   onAddRoutine: () => void; // New
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[]; // Changed from prompt string to promptPoints array
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//         "Regular breaks between sessions",
//         "Buffer time for unexpected tasks",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//         "Schedule short breaks for recovery",
//         "Maintain energy levels throughout the day",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//         "Maintain consistent break patterns",
//         "End with a wrap-up routine",
//       ],
//       color: "emerald",
//     },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-12">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Main content */}
//               <div className="mb-12 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   How Would You Like to Start?
//                 </h3>
//                 <p className="text-gray-600">
//                   Choose a template or create your schedule from scratch
//                 </p>
//               </div>

//               {/* Templates Grid */}
//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Quick Actions */}
//               <div className="mt-12 flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">G</span>
//                   <span className="text-gray-400">to generate schedule</span>
//                 </Button>
//                 <span className="text-gray-400">•</span>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">B</span>
//                   <span className="text-gray-400">to add block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">E</span>
//                   <span className="text-gray-400">to add Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">R</span>
//                   <span className="text-gray-400">to add Rotuine</span>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Command,
//   ArrowRightCircle,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void;
//   onAddRoutine: () => void;
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[];
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//       ],
//       color: "emerald",
//     },
//   ];

//   const quickLinks = [
//     { title: "Projects", path: "/dashboard/projects" },
//     { title: "Tasks", path: "/dashboard/tasks" },
//     { title: "Events", path: "/dashboard/events" },
//     { title: "Routines", path: "/dashboard/routines" },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-12">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Templates Section */}
//               <div className="mb-8 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   Choose a Template
//                 </h3>
//               </div>

//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-500 text-sm font-medium">
//                   Or
//                 </span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Actions */}
//               <div className="mb-12 flex flex-wrap justify-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">G</span>
//                   <span className="text-gray-400">Generate</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">B</span>
//                   <span className="text-gray-400">Block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">E</span>
//                   <span className="text-gray-400">Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">R</span>
//                   <span className="text-gray-400">Routine</span>
//                 </Button>
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-500 text-sm font-medium">
//                   Or add your first
//                 </span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Links */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
//                 {quickLinks.map((link) => (
//                   <a
//                     key={link.path}
//                     href={link.path}
//                     className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
//                   >
//                     <span className="font-medium">{link.title}</span>
//                     <ArrowRightCircle className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state (unchanged)
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Command,
//   ArrowRightCircle,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void;
//   onAddRoutine: () => void;
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[];
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//       ],
//       color: "emerald",
//     },
//   ];

//   const quickLinks = [
//     { title: "Projects", path: "/dashboard/projects" },
//     { title: "Tasks", path: "/dashboard/tasks" },
//     { title: "Events", path: "/dashboard/events" },
//     { title: "Routines", path: "/dashboard/routines" },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-12">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Templates Section */}
//               <div className="mb-8 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   Choose a Template
//                 </h3>
//                 <p className="text-gray-600">
//                   Select a pre-made schedule to help you get started quickly
//                 </p>
//               </div>

//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Actions Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600">
//                   Create your schedule from scratch using these keyboard
//                   shortcuts
//                 </p>
//               </div>

//               {/* Quick Actions */}
//               <div className="mb-12 flex flex-wrap justify-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">G</span>
//                   <span className="text-gray-400">Generate</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">B</span>
//                   <span className="text-gray-400">Block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">E</span>
//                   <span className="text-gray-400">Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">R</span>
//                   <span className="text-gray-400">Routine</span>
//                 </Button>
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Links Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600">
//                   Add your key activities and commitments to help create more
//                   personalized schedules
//                 </p>
//               </div>

//               {/* Quick Links */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
//                 {quickLinks.map((link) => (
//                   <a
//                     key={link.path}
//                     href={link.path}
//                     className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
//                   >
//                     <span className="font-medium">{link.title}</span>
//                     <ArrowRightCircle className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state (unchanged)
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Command,
//   ArrowRightCircle,
//   Briefcase,
//   CheckSquare,
//   Calendar,
//   LayoutList,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void;
//   onAddRoutine: () => void;
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[];
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//       ],
//       color: "emerald",
//     },
//   ];

//   const quickLinks = [
//     { title: "Projects", path: "/dashboard/projects", icon: Briefcase },
//     { title: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
//     { title: "Events", path: "/dashboard/events", icon: Calendar },
//     { title: "Routines", path: "/dashboard/routines", icon: LayoutList },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Templates Section */}
//               <div className="mb-8 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   Choose a Template
//                 </h3>
//                 <p className="text-gray-600 text-sm">
//                   Select a pre-made schedule to help you get started quickly
//                 </p>
//               </div>

//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Actions Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Create your schedule from scratch using these keyboard
//                   shortcuts
//                 </p>
//               </div>

//               {/* Quick Actions */}
//               <div className="mb-12 flex flex-wrap justify-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">G</span>
//                   <span className="text-gray-400">Generate</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">B</span>
//                   <span className="text-gray-400">Block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">E</span>
//                   <span className="text-gray-400">Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-1 h-4 w-4" />
//                   <span className="mr-1">R</span>
//                   <span className="text-gray-400">Routine</span>
//                 </Button>
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Links Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Add your key activities and commitments to help create more
//                   personalized schedules
//                 </p>
//               </div>

//               {/* Quick Links */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
//                 {quickLinks.map((link) => (
//                   <a
//                     key={link.path}
//                     href={link.path}
//                     className="group flex items-center justify-between gap-3 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
//                   >
//                     <div className="flex items-center gap-2">
//                       <link.icon className="h-5 w-5" />
//                       <span className="font-medium">{link.title}</span>
//                     </div>
//                     <ArrowRightCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state (unchanged)
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Command,
//   ArrowRightCircle,
//   Briefcase,
//   CheckSquare,
//   Calendar,
//   LayoutList,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void;
//   onAddRoutine: () => void;
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[];
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//       ],
//       color: "emerald",
//     },
//   ];

//   const quickLinks = [
//     { title: "Projects", path: "/dashboard/projects", icon: Briefcase },
//     { title: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
//     { title: "Events", path: "/dashboard/events", icon: Calendar },
//     { title: "Routines", path: "/dashboard/routines", icon: LayoutList },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Templates Section */}
//               <div className="mb-8 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   Choose a Template
//                 </h3>
//                 <p className="text-gray-600 text-sm">
//                   Select a pre-made schedule to help you get started quickly
//                 </p>
//               </div>

//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Actions Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Create your schedule from scratch using these keyboard
//                   shortcuts
//                 </p>
//               </div>

//               {/* Quick Actions */}
//               <div className="mb-12 flex flex-wrap justify-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-2 h-5 w-5" />
//                   <span className="mr-1 font-medium">G</span>
//                   <span className="text-gray-600">Generate Schedule</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-2 h-5 w-5" />
//                   <span className="mr-1 font-medium">B</span>
//                   <span className="text-gray-600">Add Time Block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-2 h-5 w-5" />
//                   <span className="mr-1 font-medium">E</span>
//                   <span className="text-gray-600">Add Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-gray-900"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-2 h-5 w-5" />
//                   <span className="mr-1 font-medium">R</span>
//                   <span className="text-gray-600">Add Routine</span>
//                 </Button>
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Links Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Add your key activities and commitments to help create more
//                   personalized schedules
//                 </p>
//               </div>

//               {/* Quick Links */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
//                 {quickLinks.map((link) => (
//                   <a
//                     key={link.path}
//                     href={link.path}
//                     className="group flex items-center justify-between gap-3 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
//                   >
//                     <div className="flex items-center gap-2">
//                       <link.icon className="h-5 w-5" />
//                       <span className="font-medium">{link.title}</span>
//                     </div>
//                     <ArrowRightCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state (unchanged)
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   PlusCircle,
//   CalendarPlus,
//   Repeat,
//   Command,
//   ArrowRightCircle,
//   Briefcase,
//   CheckSquare,
//   Calendar,
//   LayoutList,
// } from "lucide-react";

// interface NoBlocksCardProps {
//   activeTab: "active" | "completed";
//   onGenerateSchedule: () => void;
//   onAddBlock: () => void;
//   onAddEvent: () => void;
//   onAddRoutine: () => void;
//   onTemplateSelect: (template: ScheduleTemplate) => void;
// }

// interface ScheduleTemplate {
//   title: string;
//   icon: any;
//   description: string;
//   promptPoints: string[];
//   color: string;
//   shortcut?: string;
// }

// const NoBlocksCard = ({
//   activeTab,
//   onGenerateSchedule,
//   onAddBlock,
//   onAddEvent,
//   onAddRoutine,
//   onTemplateSelect,
// }: NoBlocksCardProps) => {
//   const templates = [
//     {
//       title: "Productive Day",
//       icon: PlusCircle,
//       description: "Deep work in morning, meetings afternoon, planning evening",
//       promptPoints: [
//         "Deep focused work blocks in the morning",
//         "Team meetings and collaborations in the afternoon",
//         "Planning and review session in the evening",
//       ],
//       color: "blue",
//     },
//     {
//       title: "Event Day",
//       icon: CalendarPlus,
//       description: "Balance your events with focused work and breaks",
//       promptPoints: [
//         "Organize the day around my calendar events",
//         "Add buffer time before and after meetings",
//         "Include focused work sessions between events",
//       ],
//       color: "purple",
//     },
//     {
//       title: "Routine Day",
//       icon: Repeat,
//       description: "Structure your day around your key routines",
//       promptPoints: [
//         "Start with a morning productivity routine",
//         "Include regular check-in and review points",
//         "Balance different types of work throughout the day",
//       ],
//       color: "emerald",
//     },
//   ];

//   const quickLinks = [
//     { title: "Projects", path: "/dashboard/projects", icon: Briefcase },
//     { title: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
//     { title: "Events", path: "/dashboard/events", icon: Calendar },
//     { title: "Routines", path: "/dashboard/routines", icon: LayoutList },
//   ];

//   return (
//     <div className="flex flex-col flex-1 h-full w-full">
//       <Card className="flex h-full w-full flex-col bg-white">
//         {activeTab === "active" ? (
//           <div className="flex h-full flex-col">
//             <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
//               {/* Decorative elements */}
//               <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
//               <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

//               {/* Templates Section */}
//               <div className="mb-8 text-center">
//                 <h3 className="mb-3 text-2xl font-bold text-gray-900">
//                   Choose a Template
//                 </h3>
//                 <p className="text-gray-600 text-sm">
//                   Select a pre-made schedule to help you get started quickly
//                 </p>
//               </div>

//               <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
//                 {templates.map((template, i) => (
//                   <div
//                     key={i}
//                     onClick={() => onTemplateSelect(template)}
//                     className="group relative cursor-pointer"
//                   >
//                     <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
//                     <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mb-4 text-${template.color}-500`}>
//                         <template.icon className="h-8 w-8" />
//                       </div>
//                       <h4 className="mb-2 font-semibold text-gray-900">
//                         {template.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Actions Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Create your schedule from scratch using these keyboard
//                   shortcuts
//                 </p>
//               </div>

//               {/* Quick Actions */}
//               <div className="mb-12 flex flex-wrap justify-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-blue-600 border-2 hover:border-blue-200"
//                   onClick={onGenerateSchedule}
//                 >
//                   <Command className="mr-2 h-5 w-5 text-blue-500" />
//                   <span className="mr-1 font-medium">G</span>
//                   <span className="text-gray-600">Generate Schedule</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-purple-600 border-2 hover:border-purple-200"
//                   onClick={onAddBlock}
//                 >
//                   <Command className="mr-2 h-5 w-5 text-purple-500" />
//                   <span className="mr-1 font-medium">B</span>
//                   <span className="text-gray-600">Add Time Block</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-emerald-600 border-2 hover:border-emerald-200"
//                   onClick={onAddEvent}
//                 >
//                   <Command className="mr-2 h-5 w-5 text-emerald-500" />
//                   <span className="mr-1 font-medium">E</span>
//                   <span className="text-gray-600">Add Event</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="text-gray-500 hover:text-indigo-600 border-2 hover:border-indigo-200"
//                   onClick={onAddRoutine}
//                 >
//                   <Command className="mr-2 h-5 w-5 text-indigo-500" />
//                   <span className="mr-1 font-medium">R</span>
//                   <span className="text-gray-600">Add Routine</span>
//                 </Button>
//               </div>

//               {/* Divider with "Or" */}
//               <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
//                 <div className="h-px bg-gray-200 flex-1"></div>
//                 <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
//                 <div className="h-px bg-gray-200 flex-1"></div>
//               </div>

//               {/* Quick Links Description */}
//               <div className="mb-4 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Add your key activities and commitments to help create more
//                   personalized schedules
//                 </p>
//               </div>

//               {/* Quick Links */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
//                 {quickLinks.map((link) => (
//                   <a
//                     key={link.path}
//                     href={link.path}
//                     className="group flex items-center justify-between gap-3 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
//                   >
//                     <div className="flex items-center gap-2">
//                       <link.icon className="h-5 w-5" />
//                       <span className="font-medium">{link.title}</span>
//                     </div>
//                     <ArrowRightCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Completed tab empty state (unchanged)
//           <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//             <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//             <h3 className="mb-3 text-xl font-semibold text-gray-900">
//               No Completed Blocks Yet
//             </h3>
//             <p className="text-gray-600">
//               Your completed blocks will appear here. Keep track of your
//               progress and celebrate your accomplishments as you finish tasks
//               throughout the day.
//             </p>
//             <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default NoBlocksCard;
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PlusCircle,
  CalendarPlus,
  Repeat,
  Command,
  ArrowRightCircle,
  Briefcase,
  CheckSquare,
  Calendar,
  LayoutList,
} from "lucide-react";

interface NoBlocksCardProps {
  activeTab: "active" | "completed";
  onGenerateSchedule: () => void;
  onAddBlock: () => void;
  onAddEvent: () => void;
  onAddRoutine: () => void;
  onTemplateSelect: (template: ScheduleTemplate) => void;
}

interface ScheduleTemplate {
  title: string;
  icon: any;
  description: string;
  promptPoints: string[];
  color: string;
  shortcut?: string;
}

const NoBlocksCard = ({
  activeTab,
  onGenerateSchedule,
  onAddBlock,
  onAddEvent,
  onAddRoutine,
  onTemplateSelect,
}: NoBlocksCardProps) => {
  const templates = [
    {
      title: "Productive Day",
      icon: PlusCircle,
      description: "Deep work in morning, meetings afternoon, planning evening",
      promptPoints: [
        "Deep focused work blocks in the morning",
        "Team meetings and collaborations in the afternoon",
        "Planning and review session in the evening",
      ],
      color: "blue",
    },
    {
      title: "Event Day",
      icon: CalendarPlus,
      description: "Balance your events with focused work and breaks",
      promptPoints: [
        "Organize the day around my calendar events",
        "Add buffer time before and after meetings",
        "Include focused work sessions between events",
      ],
      color: "purple",
    },
    {
      title: "Routine Day",
      icon: Repeat,
      description: "Structure your day around your key routines",
      promptPoints: [
        "Start with a morning productivity routine",
        "Include regular check-in and review points",
        "Balance different types of work throughout the day",
      ],
      color: "emerald",
    },
  ];

  const quickLinks = [
    { title: "Projects", path: "/dashboard/projects", icon: Briefcase },
    { title: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
    { title: "Events", path: "/dashboard/events", icon: Calendar },
    { title: "Routines", path: "/dashboard/routines", icon: LayoutList },
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <Card className="flex h-full w-full flex-col bg-white">
        {activeTab === "active" ? (
          <div className="flex h-full flex-col">
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
              {/* Decorative elements */}
              <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
              <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

              {/* Templates Section */}
              <div className="mb-8 text-center">
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Choose a Template
                </h3>
                <p className="text-gray-600 text-sm">
                  Select a pre-made schedule to help you get started quickly
                </p>
              </div>

              <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
                {templates.map((template, i) => (
                  <div
                    key={i}
                    onClick={() => onTemplateSelect(template)}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
                    <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className={`mb-4 text-${template.color}-500`}>
                        <template.icon className="h-8 w-8" />
                      </div>
                      <h4 className="mb-2 font-semibold text-gray-900">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider with "Or" */}
              <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Quick Actions Description */}
              <div className="mb-4 text-center">
                <p className="text-gray-600 text-sm">
                  Create your schedule from scratch using these keyboard
                  shortcuts
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mb-12 flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-blue-600 border-2 hover:border-blue-200"
                  onClick={onGenerateSchedule}
                >
                  <Command className="mr-2 h-5 w-5 text-blue-500" />
                  <span className="mr-1 font-medium">G</span>
                  <span className="text-gray-600">Generate Schedule</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-purple-600 border-2 hover:border-purple-200"
                  onClick={onAddBlock}
                >
                  <Command className="mr-2 h-5 w-5 text-purple-500" />
                  <span className="mr-1 font-medium">B</span>
                  <span className="text-gray-600">Add Time Block</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-emerald-600 border-2 hover:border-emerald-200"
                  onClick={onAddEvent}
                >
                  <Command className="mr-2 h-5 w-5 text-emerald-500" />
                  <span className="mr-1 font-medium">E</span>
                  <span className="text-gray-600">Add Event</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-indigo-600 border-2 hover:border-indigo-200"
                  onClick={onAddRoutine}
                >
                  <Command className="mr-2 h-5 w-5 text-indigo-500" />
                  <span className="mr-1 font-medium">R</span>
                  <span className="text-gray-600">Add Routine</span>
                </Button>
              </div>

              {/* Divider with "Or" */}
              <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Quick Links Description */}
              <div className="mb-4 text-center">
                <p className="text-gray-600 text-sm">
                  Add your key activities and commitments to help create more
                  personalized schedules
                </p>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                {quickLinks.map((link, i) => (
                  <a
                    key={link.path}
                    href={link.path}
                    className={`group flex items-center justify-between gap-3 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:shadow-md ${
                      i === 0
                        ? "hover:border-blue-200 hover:text-blue-600"
                        : i === 1
                        ? "hover:border-purple-200 hover:text-purple-600"
                        : i === 2
                        ? "hover:border-emerald-200 hover:text-emerald-600"
                        : "hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <link.icon
                        className={
                          i === 0
                            ? "h-5 w-5 text-blue-500"
                            : i === 1
                            ? "h-5 w-5 text-purple-500"
                            : i === 2
                            ? "h-5 w-5 text-emerald-500"
                            : "h-5 w-5 text-indigo-500"
                        }
                      />
                      <span className="font-medium">{link.title}</span>
                    </div>
                    <ArrowRightCircle
                      className={`h-4 w-4 ${
                        i === 0
                          ? "text-gray-400 group-hover:text-blue-600"
                          : i === 1
                          ? "text-gray-400 group-hover:text-purple-600"
                          : i === 2
                          ? "text-gray-400 group-hover:text-emerald-600"
                          : "text-gray-400 group-hover:text-indigo-600"
                      }`}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Completed tab empty state (unchanged)
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              No Completed Blocks Yet
            </h3>
            <p className="text-gray-600">
              Your completed blocks will appear here. Keep track of your
              progress and celebrate your accomplishments as you finish tasks
              throughout the day.
            </p>
            <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NoBlocksCard;
