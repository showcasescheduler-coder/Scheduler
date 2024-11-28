import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { cn } from "@/lib/utils";

interface SleepTimeQuestionProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const SleepTimeQuestion = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}: SleepTimeQuestionProps) => {
  const { updateQuestionnaireData, questionnaireData } = useAppContext();

  const options = [
    { value: "early", label: "Early (8-10pm)" },
    { value: "medium", label: "Medium (10pm-12am)" },
    { value: "late", label: "Late (After 12am)" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
      <Progress
        value={((currentStep + 1) / totalSteps) * 100}
        className="mb-6"
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            When do you feel ready for sleep?
          </h2>
          <p className="text-base text-gray-600">
            What time do you naturally feel ready to sleep, even without
            external factors like work or devices?
          </p>
        </div>

        <RadioGroup
          value={questionnaireData.sleepTime}
          className="grid grid-cols-1 gap-4"
          onValueChange={(value) => updateQuestionnaireData("sleepTime", value)}
        >
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={`sleep-${option.value}`}
              className="cursor-pointer"
            >
              <Card
                className={cn(
                  "transition-all border-2",
                  questionnaireData.sleepTime === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-transparent hover:border-gray-200"
                )}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={option.value}
                      id={`sleep-${option.value}`}
                    />
                    <Label
                      htmlFor={`sleep-${option.value}`}
                      className="text-lg cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              </Card>
            </label>
          ))}
        </RadioGroup>
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
