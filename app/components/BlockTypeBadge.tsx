import React from "react";
import {
  Brain,
  CalendarDays,
  Coffee,
  Dumbbell,
  FileSpreadsheet,
  Heart,
  Home,
  Users,
} from "lucide-react";

type BlockType =
  | "deep-work"
  | "break"
  | "meeting"
  | "health"
  | "exercise"
  | "admin"
  | "personal";

interface BlockTypeBadgeProps {
  type: BlockType;
}

const BlockTypeBadge = ({ type }: BlockTypeBadgeProps) => {
  const getTypeConfig = (type: BlockType) => {
    const configs = {
      "deep-work": {
        icon: Brain,
        bg: "bg-purple-50",
        text: "text-purple-700",
        label: "Deep Work",
      },
      meeting: {
        icon: Users,
        bg: "bg-sky-50",
        text: "text-sky-700",
        label: "Meeting",
      },
      break: {
        icon: Coffee,
        bg: "bg-green-50",
        text: "text-green-700",
        label: "Break",
      },
      health: {
        icon: Heart,
        bg: " bg-teal-50",
        text: " text-teal-700",
        label: "Health",
      },
      exercise: {
        icon: Dumbbell,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "Exercise",
      },
      admin: {
        icon: FileSpreadsheet,
        bg: "bg-gray-50",
        text: "text-gray-700",
        label: "Admin",
      },
      personal: {
        icon: Home,
        bg: "bg-fuchsia-50",
        text: "text-fuchsia-700",
        label: "Personal",
      },
    };
    return configs[type] || configs["admin"]; // Default to admin if type not found
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline ml-1">{config.label}</span>
    </span>
  );
};

export default BlockTypeBadge;
