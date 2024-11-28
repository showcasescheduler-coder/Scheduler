"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatrixQuestionsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function SelfControlOrganization({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}: MatrixQuestionsProps) {
  const statements = [
    "I set higher standards for myself than others typically set for me",
    "I feel energized when I have a busy and challenging schedule",
    "I seek out opportunities for personal growth even when not required",
  ];

  const ratings = [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto p-4 sm:p-8">
      <CardHeader className="space-y-6 sm:space-y-8 px-0">
        <div className="space-y-3">
          <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
            <span>3 min remaining</span>
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <Progress
            value={((currentStep + 1) / totalSteps) * 100}
            className="h-2 sm:h-3"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Work Intensity & Goal Achievement
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            How much do you agree with these statements.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 sm:space-y-10 px-0">
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-[1fr_auto] sm:gap-6">
            <div className="col-span-1" />
            <div className="grid grid-cols-5 gap-2 sm:gap-6 w-[200px] sm:w-[400px] place-items-center">
              {ratings.map((rating) => (
                <div
                  key={rating.value}
                  className="text-xs sm:text-sm text-muted-foreground text-center w-8 sm:w-16"
                >
                  {rating.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {statements.map((statement, index) => (
              <div
                key={index}
                className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto] sm:gap-6 sm:items-center"
              >
                <span className="text-base sm:text-lg font-medium">
                  "{statement}"
                </span>
                <div className="grid grid-cols-5 gap-2 sm:gap-6 w-full sm:w-[400px]">
                  {ratings.map((rating) => (
                    <Button
                      key={rating.value}
                      variant="outline"
                      className={cn(
                        "w-full h-12 sm:w-16 sm:h-16 rounded-full p-0 text-base sm:text-lg hover:bg-primary hover:text-primary-foreground",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      )}
                    >
                      {rating.value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6 sm:pt-8 border-t">
          <Button
            onClick={onPrevious}
            variant="ghost"
            size="sm"
            className="gap-2 text-sm sm:text-base sm:size-lg"
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Previous
          </Button>
          <Button
            onClick={onNext}
            size="sm"
            className="gap-2 text-sm sm:text-base sm:size-lg"
          >
            {currentStep === totalSteps - 1 ? "Complete" : "Next"}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
