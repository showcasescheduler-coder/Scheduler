// PeakEnergyQuestion component
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { cn } from "@/lib/utils";

interface QuestionProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const PeakEnergyQuestion = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}: QuestionProps) => {
  const { updateQuestionnaireData, questionnaireData } = useAppContext();

  const options = [
    { value: "early-morning", label: "Early Morning (5 AM - 8 AM)" },
    { value: "late-morning", label: "Late Morning (9 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (1 PM - 4 PM)" },
    { value: "evening", label: "Evening (5 PM - 8 PM)" },
    { value: "night", label: "Night (9 PM - 12 AM)" },
  ];

  const handleOptionToggle = (value: string) => {
    const currentSelections = questionnaireData.peakEnergyTimes || [];
    const updatedSelections = currentSelections.includes(value)
      ? currentSelections.filter((item) => item !== value)
      : [...currentSelections, value];

    updateQuestionnaireData("peakEnergyTimes", updatedSelections);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
      <Progress
        value={((currentStep + 1) / totalSteps) * 100}
        className="mb-6"
      />
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Energy Peaks
          </h2>
          <p className="text-base text-gray-600">
            At what times of day do you feel most energetic? Select all that
            apply.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={`peak-${option.value}`}
              className="cursor-pointer"
            >
              <Card
                className={cn(
                  "transition-all border-2",
                  (questionnaireData.peakEnergyTimes || []).includes(
                    option.value
                  )
                    ? "border-blue-600 bg-blue-50"
                    : "border-transparent hover:border-gray-200"
                )}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`peak-${option.value}`}
                      checked={(
                        questionnaireData.peakEnergyTimes || []
                      ).includes(option.value)}
                      onCheckedChange={() => handleOptionToggle(option.value)}
                    />
                    <Label
                      htmlFor={`peak-${option.value}`}
                      className="text-lg cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              </Card>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex items-center"
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
        >
          {currentStep === totalSteps - 1 ? "Complete" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
