import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Sparkles, Calendar, RotateCcw } from "lucide-react";

interface ScheduleGenerationDrawerProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onGenerateSchedule: (
    userInput: string,
    startTime: string,
    endTime: string
  ) => void;
  isPreviewMode: boolean;
}

export const ScheduleGenerationDrawer: React.FC<
  ScheduleGenerationDrawerProps
> = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
  const [thoughts, setThoughts] = useState([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      }, 0);
    } else {
      setThoughts([""]);
    }
  }, [isOpen]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newThoughts = [...thoughts];
      newThoughts.splice(index + 1, 0, "");
      setThoughts(newThoughts);
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }, 0);
    } else if (
      e.key === "Backspace" &&
      thoughts[index] === "" &&
      thoughts.length > 1
    ) {
      e.preventDefault();
      const newThoughts = thoughts.filter((_, i) => i !== index);
      setThoughts(newThoughts);
      setTimeout(() => {
        const prevInput = inputRefs.current[Math.max(0, index - 1)];
        if (prevInput) {
          prevInput.focus();
        }
      }, 0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newThoughts = [...thoughts];
    newThoughts[index] = e.target.value;
    setThoughts(newThoughts);
  };

  const handleComplete = () => {
    const cleanThoughts = thoughts
      .filter((thought) => thought.trim() !== "")
      .join("\n");
    onGenerateSchedule(cleanThoughts, "", "");
    setThoughts([""]);
  };

  const getPlaceholders = () => {
    if (isPreviewMode) {
      return {
        first: "E.g., Move deep work blocks to the morning...",
        additional: "Add another adjustment...",
      };
    }
    return {
      first: "Let's plan your most productive schedule...",
      additional: "Add another thought...",
    };
  };

  const placeholders = getPlaceholders();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2 text-2xl font-semibold">
              {isPreviewMode ? (
                <>
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                  Regenerate Schedule
                </>
              ) : (
                <>
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Generate Schedule
                </>
              )}
            </DrawerTitle>
            <DrawerDescription className="flex items-center text-sm text-muted-foreground">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              {isPreviewMode
                ? "What would you like to adjust in your current schedule?"
                : "What would you like to accomplish?"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            <div className="space-y-2 rounded-lg border-2 border-[#e2e8f0] p-6 bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-200 min-h-[150px]">
              {thoughts.map((thought, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-blue-600 mt-1 text-lg">•</span>
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={thought}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder={
                      index === 0 ? placeholders.first : placeholders.additional
                    }
                    className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-md w-full text-lg placeholder:text-gray-400 bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          <DrawerFooter className="px-4">
            <div className="flex gap-3 w-full">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="flex-1 border-blue-600 hover:bg-blue-50"
                >
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                className="flex-1 items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleComplete}
              >
                <Sparkles className="h-4 w-4" />
                {isPreviewMode ? "Regenerate Schedule" : "Generate Schedule"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ScheduleGenerationDrawer;
