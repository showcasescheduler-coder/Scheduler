import React, { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const loadingMessages = [
  "Analyzing your schedule...",
  "Optimizing task allocation...",
  "Balancing workload...",
  "Finalizing your personalized plan...",
  "Almost there...",
];

interface LoadingMessagesProps {
  isLoading: boolean;
  onCancel?: () => void;
  isCancellable?: boolean;
  progress: number;
  currentStep: string;
}

const LoadingMessages: React.FC<LoadingMessagesProps> = ({
  isLoading,
  onCancel,
  isCancellable = true,
  progress,
  currentStep,
}) => {
  // const [messageIndex, setMessageIndex] = useState(0);
  // const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   if (!isLoading) {
  //     setMessageIndex(0);
  //     setProgress(0);
  //     return;
  //   }

  //   // Progress calculation
  //   const progressInterval = setInterval(() => {
  //     setProgress((prev) => Math.min(prev + 1, 99));
  //   }, 150);

  //   // Message rotation
  //   const messageInterval = setInterval(() => {
  //     setMessageIndex((prevIndex) =>
  //       prevIndex < loadingMessages.length - 1 ? prevIndex + 1 : prevIndex
  //     );
  //   }, 10000);

  //   return () => {
  //     clearInterval(progressInterval);
  //     clearInterval(messageInterval);
  //   };
  // }, [isLoading]);

  if (!isLoading) return null;

  return (
    <Dialog open={isLoading} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Generating Your Schedule</h3>
            <p className="text-sm text-muted-foreground">{currentStep}</p>
          </div>

          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          {isCancellable && (
            <Button variant="outline" onClick={onCancel} className="mt-4">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Generation
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingMessages;
