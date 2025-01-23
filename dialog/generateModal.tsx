// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Sparkles, Calendar, RotateCcw } from "lucide-react";

// interface ScheduleGenerationDialogProps {
//   isOpen: boolean;
//   onClose: (open: boolean) => void;
//   onGenerateSchedule: (
//     userInput: string,
//     startTime: string,
//     endTime: string
//   ) => void;
//   isPreviewMode: boolean;
// }

// export const ScheduleGenerationDialog: React.FC<
//   ScheduleGenerationDialogProps
// > = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
//   const [thoughts, setThoughts] = useState([""]);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (isOpen) {
//       // Focus the first input after opening
//       setTimeout(() => {
//         if (inputRefs.current[0]) {
//           inputRefs.current[0]?.focus();
//         }
//       }, 0);
//     } else {
//       // Reset thoughts when dialog closes
//       setThoughts([""]);
//     }
//   }, [isOpen]);

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const newThoughts = [...thoughts];
//       newThoughts.splice(index + 1, 0, "");
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         if (inputRefs.current[index + 1]) {
//           inputRefs.current[index + 1]?.focus();
//         }
//       }, 0);
//     } else if (
//       e.key === "Backspace" &&
//       thoughts[index] === "" &&
//       thoughts.length > 1
//     ) {
//       e.preventDefault();
//       const newThoughts = thoughts.filter((_, i) => i !== index);
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         const prevInput = inputRefs.current[Math.max(0, index - 1)];
//         if (prevInput) {
//           prevInput.focus();
//         }
//       }, 0);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const newThoughts = [...thoughts];
//     newThoughts[index] = e.target.value;
//     setThoughts(newThoughts);
//   };

//   const handleComplete = () => {
//     const cleanThoughts = thoughts
//       .filter((thought) => thought.trim() !== "")
//       .join("\n");
//     onGenerateSchedule(cleanThoughts, "", ""); // Removed default time values
//     setThoughts([""]);
//   };

//   const getPlaceholders = () => {
//     if (isPreviewMode) {
//       return {
//         first: "E.g., Move deep work blocks to the morning...",
//         additional: "Add another adjustment...",
//       };
//     }
//     return {
//       first: "Let's plan your most productive schedule...",
//       additional: "Add another thought...",
//     };
//   };

//   const placeholders = getPlaceholders();

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-2xl font-semibold">
//             {isPreviewMode ? (
//               <>
//                 <RotateCcw className="h-6 w-6 text-blue-600" />
//                 Regenerate Schedule
//               </>
//             ) : (
//               <>
//                 <Calendar className="h-6 w-6 text-blue-600" />
//                 Generate Schedule
//               </>
//             )}
//           </DialogTitle>
//           <DialogDescription className="flex items-center text-sm text-muted-foreground">
//             <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
//             {isPreviewMode
//               ? "What would you like to adjust in your current schedule?"
//               : "What would you like to accomplish?"}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-2 rounded-lg border-2 border-[#e2e8f0] p-6 bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-200 min-h-[150px]">
//           {thoughts.map((thought, index) => (
//             <div key={index} className="flex items-start space-x-3">
//               <span className="text-blue-600 mt-1 text-lg">•</span>
//               <input
//                 ref={(el) => {
//                   inputRefs.current[index] = el;
//                 }}
//                 type="text"
//                 value={thought}
//                 onChange={(e) => handleChange(e, index)}
//                 onKeyDown={(e) => handleKeyDown(e, index)}
//                 placeholder={
//                   index === 0 ? placeholders.first : placeholders.additional
//                 }
//                 className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-md w-full text-lg placeholder:text-gray-400 bg-transparent"
//               />
//             </div>
//           ))}
//         </div>

//         <DialogFooter className="flex gap-3 sm:justify-start">
//           <Button
//             variant="outline"
//             className="flex-1 border-blue-600 hover:bg-blue-50"
//             onClick={() => onClose(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             className="flex-1 items-center gap-2 bg-blue-600 hover:bg-blue-700"
//             onClick={handleComplete}
//           >
//             <Sparkles className="h-4 w-4" />
//             {isPreviewMode ? "Regenerate Schedule" : "Generate Schedule"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ScheduleGenerationDialog;
// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
// } from "@/components/ui/drawer";
// import { Sparkles } from "lucide-react";

// interface ScheduleGenerationDrawerProps {
//   isOpen: boolean;
//   onClose: (open: boolean) => void;
//   onGenerateSchedule: (
//     userInput: string,
//     startTime: string,
//     endTime: string
//   ) => void;
//   isPreviewMode: boolean;
// }

// export const ScheduleGenerationDialog: React.FC<
//   ScheduleGenerationDrawerProps
// > = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
//   const [thoughts, setThoughts] = useState([""]);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => {
//         if (inputRefs.current[0]) {
//           inputRefs.current[0]?.focus();
//         }
//       }, 0);
//     } else {
//       setThoughts([""]);
//     }
//   }, [isOpen]);

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const newThoughts = [...thoughts];
//       newThoughts.splice(index + 1, 0, "");
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         if (inputRefs.current[index + 1]) {
//           inputRefs.current[index + 1]?.focus();
//         }
//       }, 0);
//     } else if (
//       e.key === "Backspace" &&
//       thoughts[index] === "" &&
//       thoughts.length > 1
//     ) {
//       e.preventDefault();
//       const newThoughts = thoughts.filter((_, i) => i !== index);
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         const prevInput = inputRefs.current[Math.max(0, index - 1)];
//         if (prevInput) {
//           prevInput.focus();
//         }
//       }, 0);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const newThoughts = [...thoughts];
//     newThoughts[index] = e.target.value;
//     setThoughts(newThoughts);
//   };

//   const handleComplete = () => {
//     const cleanThoughts = thoughts
//       .filter((thought) => thought.trim() !== "")
//       .join("\n");
//     onGenerateSchedule(cleanThoughts, "", "");
//     setThoughts([""]);
//   };

//   return (
//     <Drawer open={isOpen} onOpenChange={onClose}>
//       <DrawerContent className="h-[95vh]">
//         <div className="container max-w-4xl mx-auto h-full flex flex-col">
//           <DrawerHeader className="px-0 pt-8 pb-6 border-b">
//             <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold">
//               <Sparkles className="h-7 w-7 text-blue-600" />
//               Generate Schedule
//             </DrawerTitle>
//             <p className="text-lg text-muted-foreground mt-2 ml-10">
//               What would you like to accomplish?
//             </p>
//           </DrawerHeader>

//           <div className="flex-1 py-8 overflow-y-auto">
//             <div className="space-y-4">
//               {thoughts.map((thought, index) => (
//                 <div key={index} className="flex items-start gap-4">
//                   <span className="text-blue-600 mt-4 text-2xl">•</span>
//                   <input
//                     ref={(el) => {
//                       inputRefs.current[index] = el;
//                     }}
//                     type="text"
//                     value={thought}
//                     onChange={(e) => handleChange(e, index)}
//                     onKeyDown={(e) => handleKeyDown(e, index)}
//                     placeholder={
//                       index === 0
//                         ? "Enter your schedule requirements..."
//                         : "Add another item..."
//                     }
//                     className="flex-1 p-4 bg-zinc-50/50 rounded-lg text-lg placeholder:text-zinc-400
//                              focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white
//                              border border-zinc-200 hover:border-zinc-300 transition-colors"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <DrawerFooter className="px-0 py-6 border-t">
//             <div className="flex gap-4 w-full">
//               <DrawerClose asChild>
//                 <Button variant="outline" size="lg" className="flex-1 text-lg">
//                   Cancel
//                 </Button>
//               </DrawerClose>
//               <Button
//                 size="lg"
//                 className="flex-1 text-lg bg-blue-600 hover:bg-blue-700"
//                 onClick={handleComplete}
//               >
//                 Generate Schedule
//               </Button>
//             </div>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// };

// export default ScheduleGenerationDialog;

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerDescription,
//   DrawerClose,
// } from "@/components/ui/drawer";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Sparkles } from "lucide-react";

// interface ScheduleGenerationDrawerProps {
//   trigger?: React.ReactNode;
//   isOpen: boolean;
//   onClose: (open: boolean) => void;
//   onGenerateSchedule: (
//     userInput: string,
//     startTime: string,
//     endTime: string
//   ) => void;
//   isPreviewMode: boolean;
// }

// export const ScheduleGenerationDialog: React.FC<
//   ScheduleGenerationDrawerProps
// > = ({ trigger, isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
//   const [thoughts, setThoughts] = useState([""]);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => {
//         if (inputRefs.current[0]) {
//           inputRefs.current[0]?.focus();
//         }
//       }, 0);
//     } else {
//       setThoughts([""]);
//     }
//   }, [isOpen]);

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const newThoughts = [...thoughts];
//       newThoughts.splice(index + 1, 0, "");
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         if (inputRefs.current[index + 1]) {
//           inputRefs.current[index + 1]?.focus();
//         }
//       }, 0);
//     } else if (
//       e.key === "Backspace" &&
//       thoughts[index] === "" &&
//       thoughts.length > 1
//     ) {
//       e.preventDefault();
//       const newThoughts = thoughts.filter((_, i) => i !== index);
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         const prevInput = inputRefs.current[Math.max(0, index - 1)];
//         if (prevInput) {
//           prevInput.focus();
//         }
//       }, 0);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const newThoughts = [...thoughts];
//     newThoughts[index] = e.target.value;
//     setThoughts(newThoughts);
//   };

//   const handleComplete = () => {
//     const cleanThoughts = thoughts
//       .filter((thought) => thought.trim() !== "")
//       .join("\n");
//     onGenerateSchedule(cleanThoughts, "", "");
//     setThoughts([""]);
//   };

//   return (
//     <Drawer open={isOpen} onOpenChange={onClose}>
//       {trigger}
//       <DrawerContent className="max-h-[95vh]">
//         <div className="container max-w-3xl mx-auto flex flex-col h-full">
//           <DrawerHeader className="px-4 sm:px-6">
//             <DrawerTitle className="text-2xl font-semibold flex items-center gap-2">
//               <Sparkles className="h-5 w-5 text-blue-500" />
//               Generate Schedule
//             </DrawerTitle>
//             <DrawerDescription>
//               Let AI help you plan your day. Enter your tasks and requirements
//               below.
//             </DrawerDescription>
//           </DrawerHeader>

//           <ScrollArea className="flex-1 px-4 sm:px-6">
//             <div className="py-6">
//               <div className="space-y-2">
//                 {thoughts.map((thought, index) => (
//                   <input
//                     key={index}
//                     ref={(el) => {
//                       inputRefs.current[index] = el;
//                     }}
//                     type="text"
//                     value={thought}
//                     onChange={(e) => handleChange(e, index)}
//                     onKeyDown={(e) => handleKeyDown(e, index)}
//                     placeholder={
//                       index === 0
//                         ? "Enter your schedule requirements..."
//                         : "Press Enter to add more..."
//                     }
//                     className="w-full p-4 bg-muted/50 rounded-lg text-base placeholder:text-muted-foreground
//                              focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background
//                              border border-input hover:border-ring transition-colors"
//                   />
//                 ))}
//               </div>
//               <p className="mt-4 text-sm text-muted-foreground">
//                 Press Enter to add more items, Backspace to remove empty items
//               </p>
//             </div>
//           </ScrollArea>

//           <DrawerFooter className="px-4 sm:px-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//             <div className="flex gap-3 w-full">
//               <DrawerClose asChild>
//                 <Button variant="outline" className="flex-1">
//                   Cancel
//                 </Button>
//               </DrawerClose>
//               <Button
//                 className="flex-1"
//                 onClick={handleComplete}
//                 disabled={thoughts.every((t) => !t.trim())}
//               >
//                 Generate Schedule
//               </Button>
//             </div>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// };

// export default ScheduleGenerationDialog;

// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerDescription,
// } from "@/components/ui/drawer";
// import { Sparkles } from "lucide-react";

// interface ScheduleGenerationDrawerProps {
//   isOpen: boolean;
//   onClose: (open: boolean) => void;
//   onGenerateSchedule: (
//     userInput: string,
//     startTime: string,
//     endTime: string
//   ) => void;
//   isPreviewMode: boolean;
// }

// export const ScheduleGenerationDialog: React.FC<
//   ScheduleGenerationDrawerProps
// > = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
//   const [thoughts, setThoughts] = useState([""]);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => {
//         if (inputRefs.current[0]) {
//           inputRefs.current[0]?.focus();
//         }
//       }, 0);
//     } else {
//       setThoughts([""]);
//     }
//   }, [isOpen]);

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const newThoughts = [...thoughts];
//       newThoughts.splice(index + 1, 0, "");
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         if (inputRefs.current[index + 1]) {
//           inputRefs.current[index + 1]?.focus();
//         }
//       }, 0);
//     } else if (
//       e.key === "Backspace" &&
//       thoughts[index] === "" &&
//       thoughts.length > 1
//     ) {
//       e.preventDefault();
//       const newThoughts = thoughts.filter((_, i) => i !== index);
//       setThoughts(newThoughts);
//       setTimeout(() => {
//         const prevInput = inputRefs.current[Math.max(0, index - 1)];
//         if (prevInput) {
//           prevInput.focus();
//         }
//       }, 0);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const newThoughts = [...thoughts];
//     newThoughts[index] = e.target.value;
//     setThoughts(newThoughts);
//   };

//   const handleComplete = () => {
//     const cleanThoughts = thoughts
//       .filter((thought) => thought.trim() !== "")
//       .join("\n");
//     onGenerateSchedule(cleanThoughts, "", "");
//     setThoughts([""]);
//   };

//   return (
//     <Drawer open={isOpen} onOpenChange={onClose}>
//       <DrawerContent className="h-[95vh]">
//         <div className="container max-w-4xl mx-auto h-full flex flex-col">
//           <DrawerHeader className="px-0 pt-8 pb-6 border-b">
//             <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold">
//               <Sparkles className="h-6 w-6 text-blue-600" />
//               Generate Schedule
//             </DrawerTitle>
//             <DrawerDescription>
//               Let AI help you plan your day. Enter your tasks and requirements
//               below.
//             </DrawerDescription>
//           </DrawerHeader>

//           <div className="flex-1 py-8 overflow-y-auto">
//             <div className="space-y-4">
//               {thoughts.map((thought, index) => (
//                 <div key={index} className="flex items-start gap-3">
//                   <span className="text-blue-600 mt-3 text-xl">•</span>
//                   <input
//                     ref={(el) => {
//                       inputRefs.current[index] = el;
//                     }}
//                     type="text"
//                     value={thought}
//                     onChange={(e) => handleChange(e, index)}
//                     onKeyDown={(e) => handleKeyDown(e, index)}
//                     placeholder={
//                       index === 0
//                         ? "Enter your schedule requirements..."
//                         : "Add another item..."
//                     }
//                     className="flex-1 py-2 px-3 bg-zinc-50/50 rounded-md text-base placeholder:text-zinc-400
//                              focus:outline-none focus:ring-1 focus:ring-blue-100 focus:bg-white
//                              border border-zinc-200 hover:border-zinc-300 transition-colors"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <DrawerFooter className="px-0 py-4 border-t">
//             <div className="flex gap-3 w-full max-w-xs ml-auto">
//               <DrawerClose asChild>
//                 <Button variant="outline" className="flex-1">
//                   Cancel
//                 </Button>
//               </DrawerClose>
//               <Button
//                 className="flex-1 bg-blue-600 hover:bg-blue-700"
//                 onClick={handleComplete}
//               >
//                 Generate
//               </Button>
//             </div>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// };

// export default ScheduleGenerationDialog;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Sparkles } from "lucide-react";

interface ScheduleGenerationDrawerProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onGenerateSchedule: (
    userInput: string,
    startTime: string,
    endTime: string
  ) => void;
  isPreviewMode: boolean;
  initialPromptPoints?: string[];
}

export const ScheduleGenerationDialog: React.FC<
  ScheduleGenerationDrawerProps
> = ({
  isOpen,
  onClose,
  onGenerateSchedule,
  isPreviewMode,
  initialPromptPoints,
}) => {
  const [thoughts, setThoughts] = useState([""]);
  const [savedThoughts, setSavedThoughts] = useState<string[]>(() => {
    const saved = localStorage.getItem("savedThoughts");
    return saved ? JSON.parse(saved) : [""];
  });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isTemplateSelected = useRef(false);

  const handleComplete = useCallback(() => {
    const cleanThoughts = thoughts
      .filter((thought) => thought.trim() !== "")
      .join("\n");
    onGenerateSchedule(cleanThoughts, "", "");
    if (isTemplateSelected.current) {
      setSavedThoughts([""]);
      localStorage.setItem("savedThoughts", JSON.stringify([""]));
    }
  }, [thoughts, onGenerateSchedule]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isOpen && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, handleComplete]);

  useEffect(() => {
    if (!isTemplateSelected.current) {
      localStorage.setItem("savedThoughts", JSON.stringify(savedThoughts));
    }
  }, [savedThoughts]);

  useEffect(() => {
    if (isOpen) {
      if (initialPromptPoints && initialPromptPoints.length > 0) {
        setThoughts(initialPromptPoints);
        isTemplateSelected.current = true;
      } else if (savedThoughts.some((thought) => thought.trim() !== "")) {
        setThoughts(savedThoughts);
        isTemplateSelected.current = false;
      } else {
        setThoughts([""]);
        isTemplateSelected.current = false;
      }
    }
  }, [isOpen, initialPromptPoints, savedThoughts]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newThoughts = [...thoughts, ""];
      setThoughts(newThoughts);
      if (!isTemplateSelected.current) setSavedThoughts(newThoughts);
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    } else if (
      e.key === "Backspace" &&
      thoughts[index] === "" &&
      thoughts.length > 1
    ) {
      e.preventDefault();
      const newThoughts = thoughts.filter((_, i) => i !== index);
      setThoughts(newThoughts);
      if (!isTemplateSelected.current) setSavedThoughts(newThoughts);
      setTimeout(() => inputRefs.current[Math.max(0, index - 1)]?.focus(), 0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newThoughts = [...thoughts];
    newThoughts[index] = e.target.value;
    setThoughts(newThoughts);
    if (!isTemplateSelected.current) setSavedThoughts(newThoughts);
  };

  // const handleComplete = () => {
  //   const cleanThoughts = thoughts
  //     .filter((thought) => thought.trim() !== "")
  //     .join("\n");
  //   onGenerateSchedule(cleanThoughts, "", "");
  //   if (isTemplateSelected.current) {
  //     setSavedThoughts([""]);
  //     localStorage.setItem("savedThoughts", JSON.stringify([""]));
  //   }
  // };

  const handleClose = (open: boolean) => {
    if (!open && isTemplateSelected.current) {
      setThoughts(savedThoughts);
      isTemplateSelected.current = false;
    }
    onClose(open);
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[95vh]">
        <div className="container max-w-4xl mx-auto h-full flex flex-col">
          <div className="px-6">
            <DrawerHeader className="px-0 pt-8 pb-6 border-b">
              <DrawerTitle className="flex items-center gap-3 text-2xl font-semibold">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Generate Schedule
              </DrawerTitle>
              <DrawerDescription>
                Let AI help you plan your day. Enter your tasks and requirements
                below.
              </DrawerDescription>
            </DrawerHeader>
          </div>

          <div className="flex-1 py-8 overflow-y-auto px-6">
            <div className="space-y-4">
              {thoughts.map((thought, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-blue-600 mt-3 text-xl">•</span>
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={thought}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder={
                      index === 0
                        ? "Enter your schedule requirements..."
                        : "Add another item..."
                    }
                    className="flex-1 py-2 px-3 bg-zinc-50/50 rounded-md text-base placeholder:text-zinc-400 
                             focus:outline-none focus:ring-1 focus:ring-blue-100 focus:bg-white 
                             border border-zinc-200 hover:border-zinc-300 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="px-6">
            <DrawerFooter className="px-0 py-4 border-t">
              <div className="flex gap-3 w-full max-w-xs ml-auto">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleComplete}
                >
                  Generate (⌘/Ctrl+Enter)
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ScheduleGenerationDialog;
