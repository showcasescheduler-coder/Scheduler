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
import { Sparkles, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ScheduleGenerationDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onGenerateSchedule: (userInput: string) => void;
  isPreviewMode: boolean;
}

export const ScheduleGenerationDialog: React.FC<
  ScheduleGenerationDialogProps
> = ({ isOpen, onClose, onGenerateSchedule, isPreviewMode }) => {
  const [userInput, setUserInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getCurrentTimeBlock = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.round(minutes / 30) * 30;
    now.setMinutes(roundedMinutes, 0, 0);
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const defaultText = `Start Time: ${getCurrentTimeBlock()}
End Time: 10:00 PM
`; // Added an extra newline here

  useEffect(() => {
    if (isOpen && !userInput) {
      setUserInput(defaultText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            defaultText.length,
            defaultText.length
          );
        }
      }, 0);
    }
  }, [isOpen, userInput]);

  const handleComplete = () => {
    onGenerateSchedule(userInput);
    setUserInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold">
            <Calendar className="h-6 w-6 text-blue-600" />
            Generate Schedule
          </DialogTitle>
          <DialogDescription className="flex items-center text-sm text-muted-foreground">
            <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
            What would you like to accomplish?
          </DialogDescription>
        </DialogHeader>

        <Textarea
          ref={textareaRef}
          className="min-h-[150px] resize-none text-base leading-relaxed"
          placeholder="Describe your goals for this time block..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

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
            Generate Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleGenerationDialog;
