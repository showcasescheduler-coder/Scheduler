import React, { useState, useRef, useEffect } from "react"; // Added useRef and useEffect
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

interface ScheduleGenerationDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onGenerateSchedule: (
    userInput: string,
    startTime: string,
    endTime: string
  ) => void;
}

export const ScheduleGenerationDialog: React.FC<
  ScheduleGenerationDialogProps
> = ({ isOpen, onClose, onGenerateSchedule }) => {
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUserInput("");
      setStartTime("09:00");
      setEndTime("17:00");

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  const handleComplete = () => {
    onGenerateSchedule(userInput, startTime, endTime);
    setUserInput("");
    setStartTime("09:00");
    setEndTime("17:00");
  };

  const handleTimeInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.blur();
    setTimeout(() => {
      e.target.focus();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Your Daily Schedule</DialogTitle>
          <DialogDescription>
            Please provide some information about how you'd like your day
            planned out.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule-input">Your preferences</Label>
            <Textarea
              id="schedule-input"
              placeholder="E.g., I want to focus on work in the morning, exercise in the afternoon, and have some free time in the evening."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              ref={startTimeInputRef}
              onFocus={handleTimeInputFocus}
              autoComplete="off"
              className="touch-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-time">End Time</Label>
            <Input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleComplete}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
