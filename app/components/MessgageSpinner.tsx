import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const loadingMessages = [
  "Analyzing your schedule...",
  "Optimizing task allocation...",
  "Balancing workload...",
  "Finalizing your personalized plan...",
  "Almost there...",
];

interface LoadingMessagesProps {
  isLoading: boolean;
}

const LoadingMessages: React.FC<LoadingMessagesProps> = ({ isLoading }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) =>
        prevIndex < loadingMessages.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 10000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center space-x-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-lg font-medium">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default LoadingMessages;
