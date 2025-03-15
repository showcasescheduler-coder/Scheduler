import React from "react";
import { Loader2 } from "lucide-react"; // using a lucide-react icon as a spinner

const StreamingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      <p className="mt-2 text-sm text-gray-600">Streaming your schedule...</p>
    </div>
  );
};

export default StreamingIndicator;
