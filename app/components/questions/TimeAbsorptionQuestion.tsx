import React from "react";
import { Card } from "@/components/ui/card";
import { useAppContext } from "../../context/AppContext";
import { cn } from "@/lib/utils";

export const TimeAbsorptionQuestion = () => {
  const { updateQuestionnaireData, questionnaireData } = useAppContext();

  const options = [
    { value: "1", label: "Strongly Disagree" },
    { value: "2", label: "Disagree" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Agree" },
    { value: "5", label: "Strongly Agree" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          How much do you agree with this statement?
        </h1>

        <blockquote className="border-l-4 border-gray-200 pl-4">
          <p className="text-xl font-medium text-gray-800">
            "I find it easy to become completely absorbed in my work"
          </p>
        </blockquote>

        {/* <div className="text-sm text-muted-foreground">
          This helps us understand how deeply you typically engage with your
          work and whether you frequently experience &apos;flow&apos; states.
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              updateQuestionnaireData("timeAbsorption", option.value)
            }
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <Card
              className={cn(
                "transition-all border-2",
                questionnaireData.timeAbsorption === option.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-transparent hover:border-gray-200"
              )}
            >
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      questionnaireData.timeAbsorption === option.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {option.value}
                  </div>
                  <div className="text-lg font-medium">{option.label}</div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};
