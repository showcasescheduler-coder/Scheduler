import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Calendar, RotateCcw } from "lucide-react";

interface ScheduleGenerationDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onGenerateSchedule: (
    userInput: string,
    startTime: string,
    endTime: string
  ) => void;
  isPreviewMode: boolean;
}

export const ScheduleGenerationDialog: React.FC<
  ScheduleGenerationDialogProps
> = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
  const [thoughts, setThoughts] = useState([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  console.log(isPreviewMode);

  useEffect(() => {
    if (isOpen) {
      // Focus the first input after opening
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      }, 0);
    } else {
      // Reset thoughts when dialog closes
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
    onGenerateSchedule(cleanThoughts, "", ""); // Removed default time values
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold">
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
          </DialogTitle>
          <DialogDescription className="flex items-center text-sm text-muted-foreground">
            <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
            {isPreviewMode
              ? "What would you like to adjust in your current schedule?"
              : "What would you like to accomplish?"}
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="flex gap-3 sm:justify-start">
          <Button
            variant="outline"
            className="flex-1 border-blue-600 hover:bg-blue-50"
            onClick={() => onClose(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleComplete}
          >
            <Sparkles className="h-4 w-4" />
            {isPreviewMode ? "Regenerate Schedule" : "Generate Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleGenerationDialog;
