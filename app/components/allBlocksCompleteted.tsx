import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, ChevronDown, RotateCcw } from "lucide-react";
import React from "react";

// Types shared between components
interface Block {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  tasks: {
    _id: string;
    name: string;
    completed: boolean;
  }[];
  status: "pending" | "complete";
}

interface PerformanceRating {
  level: string;
  score: number;
  comment: string;
}

// AllBlocksCompleted.tsx
interface AllBlocksCompletedProps {
  onCompleteDay: () => void;
  onAddNewBlock: () => void;
}

const AllBlocksCompleted: React.FC<AllBlocksCompletedProps> = ({
  onCompleteDay,
  onAddNewBlock,
}) => {
  return (
    <Card className="w-full border-2 border-primary/10 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
          <AlertCircle className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0" />
          <span>All Blocks Completed</span>
        </CardTitle>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p>
            Congratulations! You have completed all your blocks for the day.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <Button
            onClick={onCompleteDay}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Complete Day
          </Button>
          <Button
            variant="outline"
            onClick={onAddNewBlock}
            className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 transition-colors"
          >
            Add New Block
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllBlocksCompleted;
