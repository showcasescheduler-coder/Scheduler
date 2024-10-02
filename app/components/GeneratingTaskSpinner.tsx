import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const generatingTasksMessages = [
  "Analyzing project requirements...",
  "Breaking down project into manageable tasks...",
  "Estimating task durations and priorities...",
  "Sequencing tasks for optimal workflow...",
  "Finalizing task list for your project...",
];

interface GeneratingTasksMessagesProps {
  isGenerating: boolean;
}

const GeneratingTasksMessages: React.FC<GeneratingTasksMessagesProps> = ({
  isGenerating,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) =>
        prevIndex < generatingTasksMessages.length - 1
          ? prevIndex + 1
          : prevIndex
      );
    }, 10000); // Change message every 10 seconds

    return () => clearInterval(intervalId);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="flex items-center justify-center space-x-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-lg font-medium">
        {generatingTasksMessages[messageIndex]}
      </p>
    </div>
  );
};

export default GeneratingTasksMessages;
