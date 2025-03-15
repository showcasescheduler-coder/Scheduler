import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PlusCircle,
  CalendarPlus,
  Repeat,
  Command,
  ArrowRightCircle,
  Briefcase,
  CheckSquare,
  Calendar,
  LayoutList,
  Brain,
  GraduationCap,
  Coffee,
  Wand2,
  Clock,
  CalendarDays,
  RotateCw,
} from "lucide-react";

interface NoBlocksCardProps {
  activeTab: "active" | "completed";
  onGenerateSchedule: () => void;
  onAddBlock: () => void;
  onAddEvent: () => void;
  onAddRoutine: () => void;
  onTemplateSelect: (template: ScheduleTemplate) => void;
}

interface ScheduleTemplate {
  title: string;
  icon: any;
  description: string;
  promptPoints: string[];
  color: string;
  shortcut?: string;
}

const NoBlocksCard = ({
  activeTab,
  onGenerateSchedule,
  onAddBlock,
  onAddEvent,
  onAddRoutine,
  onTemplateSelect,
}: NoBlocksCardProps) => {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    const checkIfMac = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return userAgent.indexOf("mac") !== -1;
    };

    setIsMac(checkIfMac());
  }, []);

  const modifierKey = isMac ? "⌘" : "Ctrl";

  const templates = [
    {
      title: "Deep Work Focus Day",
      icon: Brain,
      description: "Optimize your day for intense focus and complex tasks",
      promptPoints: [
        "Begin with a science-backed morning routine (light exposure, movement, and protein-rich breakfast)",
        "Schedule 2-3 deep work blocks (90 minutes each) during your peak energy hours",
        "Place challenging tasks in the morning when cognitive function is highest",
        "Include 15-20 minute breaks between deep work for optimal recovery",
        "Add a midday walk or movement break to boost afternoon energy",
        "Schedule lighter tasks and communication during natural energy dips",
        "End with a calming evening routine (dim lights, light reading, next-day planning)",
      ],
      color: "blue",
    },
    {
      title: "Balanced Routine Day",
      icon: Repeat,
      description:
        "Create consistent daily rhythms for sustainable productivity",
      promptPoints: [
        "Start with an energizing morning routine (natural light, gentle movement, hydration)",
        "Alternate between 60-minute focused work and short breaks",
        "Include three daily planning check-ins (morning, midday, afternoon)",
        "Schedule regular movement breaks every 2-3 hours",
        "Group similar tasks together to minimize context switching",
        "Protect your meal times and break periods",
        "Close your day with a wind-down routine (review, planning, relaxation)",
      ],
      color: "emerald",
    },
    {
      title: "Relaxed Work Day",
      icon: Coffee,
      description: "Balance productivity with flexibility and wellbeing",
      promptPoints: [
        "Begin with a gentle morning routine (stretching, light exercise, mindful breakfast)",
        "Work in shorter 45-minute focused sessions",
        "Allow buffer time between tasks for natural transitions",
        "Include regular breaks for movement and social connection",
        "Schedule creative or enjoyable tasks throughout the day",
        "Build in time for spontaneous activities or rest",
        "End with a relaxing evening routine (reflection, light activity, unwinding)",
      ],
      color: "purple",
    },
  ];

  const quickLinks = [
    { title: "Projects", path: "/dashboard/projects", icon: Briefcase },
    { title: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
    { title: "Events", path: "/dashboard/events", icon: Calendar },
    { title: "Routines", path: "/dashboard/routines", icon: LayoutList },
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <Card className="flex h-full w-full flex-col bg-white">
        {activeTab === "active" ? (
          <div className="flex h-full flex-col">
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
              {/* Decorative elements */}
              <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-100/30 blur-3xl"></div>
              <div className="absolute right-0 top-1/4 h-48 w-48 translate-x-1/2 bg-purple-100/30 blur-3xl"></div>

              {/* Templates Section */}
              <div className="mb-8 text-center">
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Choose a Template
                </h3>
                <p className="text-gray-600 text-sm">
                  Select a pre-made schedule to help you get started quickly
                </p>
              </div>

              <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3 mb-12">
                {templates.map((template, i) => (
                  <div
                    key={i}
                    onClick={() => onTemplateSelect(template)}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
                    <div className="relative flex flex-col rounded-lg border-2 border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className={`mb-4 text-${template.color}-500`}>
                        <template.icon className="h-8 w-8" />
                      </div>
                      <h4 className="mb-2 font-semibold text-gray-900">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider with "Or" */}
              <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Quick Actions Description */}
              <div className="mb-4 text-center">
                <p className="text-gray-600 text-sm">
                  Create your schedule from scratch using these keyboard
                  shortcuts
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mb-12 flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-blue-600 border-2 hover:border-blue-200"
                  onClick={onGenerateSchedule}
                >
                  {/* Mobile icon - only visible on small screens */}
                  <Wand2 className="md:hidden mr-2 h-5 w-5 text-blue-500" />

                  {/* Desktop shortcuts - only visible on medium screens and up */}
                  {isMac ? (
                    <Command className="hidden md:inline-block mr-2 h-5 w-5 text-blue-500" />
                  ) : (
                    <span className="hidden md:inline-block mr-2 text-blue-500 font-medium">
                      Ctrl
                    </span>
                  )}
                  <span className="hidden md:inline-block mr-1 font-medium">
                    G
                  </span>

                  <span className="text-gray-600">Generate Schedule</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-purple-600 border-2 hover:border-purple-200"
                  onClick={onAddBlock}
                >
                  {/* Mobile icon - only visible on small screens */}
                  <Clock className="md:hidden mr-2 h-5 w-5 text-purple-500" />

                  {/* Desktop shortcuts - only visible on medium screens and up */}
                  {isMac ? (
                    <Command className="hidden md:inline-block mr-2 h-5 w-5 text-purple-500" />
                  ) : (
                    <span className="hidden md:inline-block mr-2 text-purple-500 font-medium">
                      Ctrl
                    </span>
                  )}
                  <span className="hidden md:inline-block mr-1 font-medium">
                    B
                  </span>

                  <span className="text-gray-600">Add Time Block</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-emerald-600 border-2 hover:border-emerald-200"
                  onClick={onAddEvent}
                >
                  {/* Mobile icon - only visible on small screens */}
                  <CalendarDays className="md:hidden mr-2 h-5 w-5 text-emerald-500" />

                  {/* Desktop shortcuts - only visible on medium screens and up */}
                  {isMac ? (
                    <Command className="hidden md:inline-block mr-2 h-5 w-5 text-emerald-500" />
                  ) : (
                    <span className="hidden md:inline-block mr-2 text-emerald-500 font-medium">
                      Ctrl
                    </span>
                  )}
                  <span className="hidden md:inline-block mr-1 font-medium">
                    E
                  </span>

                  <span className="text-gray-600">Add Event</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-500 hover:text-indigo-600 border-2 hover:border-indigo-200"
                  onClick={onAddRoutine}
                >
                  {/* Mobile icon - only visible on small screens */}
                  <RotateCw className="md:hidden mr-2 h-5 w-5 text-indigo-500" />

                  {/* Desktop shortcuts - only visible on medium screens and up */}
                  {isMac ? (
                    <Command className="hidden md:inline-block mr-2 h-5 w-5 text-indigo-500" />
                  ) : (
                    <span className="hidden md:inline-block mr-2 text-indigo-500 font-medium">
                      Ctrl
                    </span>
                  )}
                  <span className="hidden md:inline-block mr-1 font-medium">
                    R
                  </span>

                  <span className="text-gray-600">Add Routine</span>
                </Button>
              </div>

              {/* Divider with "Or" */}
              <div className="w-full max-w-3xl mb-8 flex items-center justify-center">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-4 text-gray-900 text-lg font-bold">Or</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Quick Links Description */}
              <div className="mb-4 text-center">
                <p className="text-gray-600 text-sm">
                  Add your key activities and commitments to help create more
                  personalized schedules
                </p>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                {quickLinks.map((link, i) => (
                  <a
                    key={link.path}
                    href={link.path}
                    className={`group flex items-center justify-between gap-3 rounded-lg border-2 border-gray-100 bg-white p-4 text-gray-600 transition-all hover:shadow-md ${
                      i === 0
                        ? "hover:border-blue-200 hover:text-blue-600"
                        : i === 1
                        ? "hover:border-purple-200 hover:text-purple-600"
                        : i === 2
                        ? "hover:border-emerald-200 hover:text-emerald-600"
                        : "hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <link.icon
                        className={
                          i === 0
                            ? "h-5 w-5 text-blue-500"
                            : i === 1
                            ? "h-5 w-5 text-purple-500"
                            : i === 2
                            ? "h-5 w-5 text-emerald-500"
                            : "h-5 w-5 text-indigo-500"
                        }
                      />
                      <span className="font-medium">{link.title}</span>
                    </div>
                    <ArrowRightCircle
                      className={`h-4 w-4 ${
                        i === 0
                          ? "text-gray-400 group-hover:text-blue-600"
                          : i === 1
                          ? "text-gray-400 group-hover:text-purple-600"
                          : i === 2
                          ? "text-gray-400 group-hover:text-emerald-600"
                          : "text-gray-400 group-hover:text-indigo-600"
                      }`}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Completed tab empty state (unchanged)
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              No Completed Blocks Yet
            </h3>
            <p className="text-gray-600">
              Your completed blocks will appear here. Keep track of your
              progress and celebrate your accomplishments as you finish tasks
              throughout the day.
            </p>
            <div className="mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NoBlocksCard;
