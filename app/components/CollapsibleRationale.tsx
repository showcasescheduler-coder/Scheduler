import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CollapsibleRationale = ({ rationale }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get first 100 characters for preview (about 2 lines)
  const previewText =
    rationale && rationale.length > 100
      ? `${rationale.substring(0, 100)}...`
      : rationale;

  if (!rationale) return null;

  return (
    <Card className="mt-3 bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">AI explanation of your schedule</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1">
          {/* Mobile view with toggle */}
          <div className="sm:hidden">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-700">
                {isExpanded ? rationale : previewText}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 flex-shrink-0 text-gray-500 hover:text-gray-700"
                aria-label={
                  isExpanded ? "Collapse rationale" : "Expand rationale"
                }
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop view always expanded */}
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">{rationale}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CollapsibleRationale;
