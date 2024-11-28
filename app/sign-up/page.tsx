// pages/SurveyPage.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { WakeTimeQuestion } from "../components/questions/WakeTimeQuestion";
import { FocusDurationQuestion } from "../components/questions/FocusDurationQuestion";
import { useAppContext } from "../context/AppContext";
import { SleepTimeQuestion } from "../components/questions/SleepTimeQuestion";
import { PeakEnergyQuestion } from "../components/questions/PeakEnergyQuestion";
import { BreakQuestion } from "../components/questions/BreakQuestion";
import { WorkSituationQuestion } from "../components/questions/WorkSituationQuestion";
import { TimeAbsorptionQuestion } from "../components/questions/TimeAbsorptionQuestion";
import { InterruptionRecoveryQuestion } from "../components/questions/InterruptionRecoveryQuestion";
import { WorkIntensityQuestion } from "../components/questions/WorkIntensityQuestion";
import { PersonalStandardsQuestion } from "../components/questions/PersonalStandardsQuestion";
import { ScheduleAdherenceQuestion } from "../components/questions/ScheduleAdherenceQuestion";
import { ProcrastinationQuestion } from "../components/questions/ProcrastinationQuestion";
import ProductivityProfile from "../components/questions/ProductivityProfile";
import FlowDeepWorkCapacity from "../components/questions/FlowDeepWorkCapacity";
import WorkIntensityGoalAcheievment from "../components/questions/WorkIntensityGoalAcheievment";
import SelfControlOrganization from "../components/questions/SelfControlOrganization";

const SurveyPage = () => {
  const { currentQuestionStep, setCurrentQuestionStep, questionnaireData } =
    useAppContext();

  const handleNext = () => {
    if (currentQuestionStep < questions.length - 1) {
      setCurrentQuestionStep(currentQuestionStep + 1);
    } else {
      console.log("Survey completed:", questionnaireData);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionStep > 0) {
      setCurrentQuestionStep(currentQuestionStep - 1);
    }
  };

  const questions = [
    <WakeTimeQuestion
      key="wake-time"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <SleepTimeQuestion
      key="sleep-time"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <PeakEnergyQuestion
      key="peak-energy-time"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <FocusDurationQuestion
      key="focus-duration"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <BreakQuestion
      key="break"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <WorkSituationQuestion
      key="work-situation"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <FlowDeepWorkCapacity
      key="enhanced-standards"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <WorkIntensityGoalAcheievment
      key="enhanced-standards"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    <SelfControlOrganization
      key="enhanced-standards"
      currentStep={currentQuestionStep}
      totalSteps={14}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />,
    // <TimeAbsorptionQuestion
    //   key="time-absorption"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <InterruptionRecoveryQuestion
    //   key="interruption-recovery"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <WorkIntensityQuestion
    //   key="work-intensity"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <PersonalStandardsQuestion
    //   key="personal-standards"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <ScheduleAdherenceQuestion
    //   key="schedule-adherence"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <ProcrastinationQuestion
    //   key="procrastination"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
    // <ProductivityProfile
    //   key="productivity-profile"
    //   currentStep={currentQuestionStep}
    //   totalSteps={14}
    //   onNext={handleNext}
    //   onPrevious={handlePrevious}
    // />,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">
              ScheduleSmart
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {questions[currentQuestionStep]}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          &copy; {new Date().getFullYear()} ScheduleSmart. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SurveyPage;
