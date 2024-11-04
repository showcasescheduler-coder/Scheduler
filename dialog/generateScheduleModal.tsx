import React, { useState } from "react";
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
import { Sparkles, RefreshCw } from "lucide-react";

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
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleComplete = () => {
    onGenerateSchedule(userInput, startTime, endTime);
    setUserInput("");
    setStartTime("09:00");
    setEndTime("17:00");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isPreviewMode
              ? "Modify Your Schedule"
              : "Generate Your Daily Schedule"}
          </DialogTitle>
          <DialogDescription>
            {isPreviewMode
              ? "Let us know what changes you'd like to make to your schedule."
              : "Please provide some information about how you'd like your day planned out."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule-input">
              {isPreviewMode ? "Desired Changes" : "Your Schedule Preferences"}
            </Label>
            <Textarea
              id="schedule-input"
              placeholder={
                isPreviewMode
                  ? "E.g., Move the exercise block earlier, add more breaks between tasks, or prioritize project work in the morning."
                  : "E.g., I want to focus on work in the morning, exercise in the afternoon, and have some free time in the evening."
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
          {!isPreviewMode && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  type="time"
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleComplete}>
            {isPreviewMode ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Schedule
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
