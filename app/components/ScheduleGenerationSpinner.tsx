import React, { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScheduleGenerationSpinnerProps {
  progress: number;
  status: string;
}

const ScheduleGenerationSpinner: React.FC<ScheduleGenerationSpinnerProps> = ({
  progress,
  status,
}) => {
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (progress === 30) {
      // Set up incremental progress updates during the 30% phase
      const incrementProgress = () => {
        setDisplayProgress((prev) => {
          const next = prev + 10;
          if (next <= 60) {
            // Update status message based on progress
            switch (next) {
              case 40:
                setCurrentStatus("Analyzing schedule patterns...");
                break;
              case 50:
                setCurrentStatus("Optimizing task distribution...");
                break;
              case 60:
                console.log("this is the 60% its fake");
                setCurrentStatus("Finalizing block arrangements...");
                break;
            }
            // Schedule next increment with longer intervals
            timeoutId = setTimeout(incrementProgress, 5000); // Increased from 3000 to 5000
            return next;
          }
          return prev;
        });
      };

      // Start the increment process after 3 seconds at 30%
      timeoutId = setTimeout(incrementProgress, 3000); // Increased from 2000 to 3000
    } else {
      setDisplayProgress(progress);
      setCurrentStatus(status);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [progress, status]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      <div className="w-full space-y-8">
        {/* Brain Icon with Pulsing Animation */}
        <div className="relative flex justify-center">
          <Brain className="h-16 w-16 text-blue-600 animate-pulse" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-8">
          <div className="flex justify-between font-medium text-sm text-gray-700">
            <span className="font-semibold">Generating schedule...</span>
            <span className="font-semibold">
              {Math.round(displayProgress)}%
            </span>
          </div>
          <Progress
            value={displayProgress}
            className="h-2 [&>div]:bg-blue-600" // Makes the progress indicator blue
          />
        </div>

        {/* Status Message */}
        <div className="text-center space-y-3">
          <p className="text-gray-700 text-base font-medium transition-all duration-300">
            {currentStatus}
          </p>
          <p className="text-sm text-gray-600">
            Please wait while we optimize your schedule
          </p>
          {displayProgress >= 30 && displayProgress < 60 && (
            <p className="text-sm text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-md inline-block mt-2">
              Processing complex schedule arrangements...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGenerationSpinner;
