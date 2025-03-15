import React from "react";
import { Repeat } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SourceBadgeProps {
  type: string; // This will be the routineId
  tooltipText?: string; // Optional custom tooltip text
}

const SourceBadge: React.FC<SourceBadgeProps> = ({
  type,
  tooltipText = "Routine Block", // Default tooltip text
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="
              inline-flex 
              items-center 
              rounded-md 
              px-2 
              py-1 
              text-xs 
              font-medium
              bg-emerald-100
              text-emerald-700
              border
              border-emerald-300

            "
          >
            <Repeat className="h-3 w-3" />
            {/* <span className="hidden sm:inline ml-1">Regular Routine</span> */}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SourceBadge;
