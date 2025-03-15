import React from "react";
import { LoaderCircle } from "lucide-react";

const StreamingOverlay = ({ message = "Loading more blocks..." }) => {
  console.log("is this running");

  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <LoaderCircle className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default StreamingOverlay;
