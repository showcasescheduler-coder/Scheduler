import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Brain, Battery, Calendar } from "lucide-react";

export default function ProductivityProfile() {
  // In a real application, these values would come from the questionnaire data
  const profileData = {
    flowProfile: "Focused Achiever",
    peakHours: "9 AM - 12 PM",
    workBlockStyle: "90-minute",
    flowScore: 4,
    organizationScore: 3.5,
    intensityScore: 4.5,
  };

  const getFlowTag = (score: number) => {
    if (score >= 4) return "Deep Diver";
    if (score >= 3) return "Balanced Focuser";
    return "Agile Switcher";
  };

  const getOrganizationTag = (score: number) => {
    if (score >= 4) return "Structured Planner";
    if (score >= 3) return "Flexible Organizer";
    return "Adaptive Arranger";
  };

  const getIntensityTag = (score: number) => {
    if (score >= 4) return "High-Intensity Achiever";
    if (score >= 3) return "Steady Performer";
    return "Balanced Progressor";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Your Personalized Productivity Profile
      </h1>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🎯 Executive Summary
        </h2>
        <p className="text-lg text-gray-700">
          Based on your responses, you're a{" "}
          <strong>{profileData.flowProfile}</strong> who thrives in{" "}
          <strong>{profileData.peakHours}</strong> and performs best with{" "}
          <strong>{profileData.workBlockStyle}</strong> work sessions. Our AI
          will optimize your schedule around these natural patterns.
        </p>
      </Card>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          ⚡ Your Core Performance Metrics
        </h2>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            1. Flow & Deep Work Capacity
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">
              Score: {profileData.flowScore}/5
            </span>
            <Progress value={profileData.flowScore * 20} className="w-1/2" />
          </div>
          <p className="text-gray-600 mb-4">
            Your profile suggests you're a{" "}
            <strong>{getFlowTag(profileData.flowScore)}</strong>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">
              What this means for your schedule:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Optimal work block duration: 90 minutes</li>
              <li>Buffer time between tasks: 15 minutes</li>
              <li>Best environment: Quiet, distraction-free space</li>
            </ul>
          </div>
          <div className="mt-4 flex items-start">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Brain className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">
              <strong>Pro Tip:</strong> Given your flow pattern, try to protect
              your morning slots from interruptions. We'll prioritize your most
              demanding tasks during these periods.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            2. Self-Organization Style
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">
              Score: {profileData.organizationScore}/5
            </span>
            <Progress
              value={profileData.organizationScore * 20}
              className="w-1/2"
            />
          </div>
          <p className="text-gray-600 mb-4">
            Your responses indicate you're a{" "}
            <strong>{getOrganizationTag(profileData.organizationScore)}</strong>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">
              What this means for your schedule:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Schedule flexibility: Medium</li>
              <li>Task transition style: Structured with some flexibility</li>
              <li>Ideal planning horizon: Weekly</li>
            </ul>
          </div>
          <div className="mt-4 flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <Calendar className="text-green-500" />
            </div>
            <p className="text-sm text-gray-600">
              <strong>Pro Tip:</strong> We've noticed you perform best with a
              structured yet adaptable schedule. We'll build in 10 minutes of
              buffer time between major tasks to maintain your momentum.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            3. Work Intensity & Achievement Drive
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">
              Score: {profileData.intensityScore}/5
            </span>
            <Progress
              value={profileData.intensityScore * 20}
              className="w-1/2"
            />
          </div>
          <p className="text-gray-600 mb-4">
            Your work style aligns with a{" "}
            <strong>{getIntensityTag(profileData.intensityScore)}</strong>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">
              What this means for your schedule:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Daily task load: High, with strategic breaks</li>
              <li>Challenge distribution: Front-loaded in the day</li>
              <li>
                Energy management style: Intense bursts with recovery periods
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-start">
            <div className="bg-yellow-100 p-3 rounded-full mr-3">
              <Battery className="text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">
              <strong>Pro Tip:</strong> For your intensity level, we recommend
              tackling your most challenging tasks during your peak hours (9 AM
              - 12 PM) when your energy typically peaks.
            </p>
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🎯 Your Personalized Schedule Strategy
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Protected Power Hours
            </h3>
            <p className="text-gray-600">
              Based on your peak productivity time (9 AM - 12 PM), we recommend:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Blocking 3 hours for deep work during 9 AM - 12 PM</li>
              <li>Avoiding meetings during 9 AM - 1 PM</li>
              <li>
                Scheduling breaks at 10:30 AM and 12 PM to maintain energy
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Optimal Task Distribution
            </h3>
            <p className="text-gray-600">We'll organize your day with:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Deep work blocks: 9 AM - 12 PM, 2 PM - 3:30 PM</li>
              <li>Collaborative work: 1 PM - 2 PM, 3:30 PM - 4:30 PM</li>
              <li>Administrative tasks: 8:30 AM - 9 AM, 4:30 PM - 5 PM</li>
              <li>Learning/Growth: 5 PM - 5:30 PM</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Energy Management
            </h3>
            <p className="text-gray-600">Your responses suggest you should:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Start complex tasks by 9 AM</li>
              <li>Take renewal breaks every 90 minutes</li>
              <li>Plan lower-intensity work after 3:30 PM</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📈 Maximizing Your Schedule
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Schedule Protection Strategies
            </h3>
            <ol className="list-decimal list-inside text-gray-600 mt-2">
              <li>Block your peak hours (9 AM - 12 PM) for important work</li>
              <li>Schedule meetings in 1 PM - 3:30 PM range</li>
              <li>Build in 15 minutes of buffer time between tasks</li>
              <li>Plan breaks every 90 minutes during intense work periods</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Key Success Habits
            </h3>
            <p className="text-gray-600">
              Based on your profile, we recommend:
            </p>
            <ol className="list-decimal list-inside text-gray-600 mt-2">
              <li>
                <strong>Morning Routine:</strong> Start your day with a
                15-minute planning session at 8:30 AM
              </li>
              <li>
                <strong>Task Transitions:</strong> Use the Pomodoro technique
                with 90-minute work blocks
              </li>
              <li>
                <strong>Energy Management:</strong> Take a 15-minute break after
                each 90-minute deep work session
              </li>
              <li>
                <strong>Schedule Reviews:</strong> End each day with a 10-minute
                review and plan for tomorrow
              </li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🚀 Next Steps
        </h2>
        <ol className="list-decimal list-inside text-gray-600 space-y-2">
          <li>Review your calendar and block your power hours</li>
          <li>Set up notification preferences aligned with your work style</li>
          <li>Start each day with a quick schedule review</li>
          <li>Track your energy levels to refine these insights</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500 italic">
          Our AI will continuously learn from your schedule interactions to
          refine these recommendations and optimize your daily flow.
        </p>
      </Card>

      <div className="text-center">
        <Button className="mt-8">
          Get Started with Your Optimized Schedule{" "}
          <ArrowRight className="ml-2" />
        </Button>
      </div>

      <footer className="text-center text-sm text-gray-500 mt-8">
        <p>
          Schedule Genius uses advanced behavioral science and machine learning
          to adapt these insights into your personalized daily schedule. Your
          profile will be automatically updated as we learn more about your
          productivity patterns.
        </p>
      </footer>
    </div>
  );
}
