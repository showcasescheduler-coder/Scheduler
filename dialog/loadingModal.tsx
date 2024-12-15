// LoadingModal.tsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface LoadingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  progress: number;
  currentStep: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  onCancel,
  progress = 0,
  currentStep = "",
}) => {
  const loadingMessages: readonly string[] = [
    "Analyzing your tasks and events...",
    "Optimizing your schedule...",
    "Balancing workload and breaks...",
    "Finalizing your personalized schedule...",
  ] as const;

  const [messageIndex, setMessageIndex] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, loadingMessages.length]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Generating Your Schedule</h3>
            <p className="text-sm text-muted-foreground">
              {currentStep || loadingMessages[messageIndex]}
            </p>
          </div>

          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          <Button variant="outline" onClick={onCancel} className="mt-4">
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Generation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
