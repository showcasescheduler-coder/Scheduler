import {
  Brain,
  CalendarDays,
  Coffee,
  FileSpreadsheet,
  Users,
} from "lucide-react";

type BlockType = "deep-work" | "planning" | "break" | "admin" | "collaboration";

interface BlockTypeBadgeProps {
  type: BlockType;
}

const BlockTypeBadge = ({ type }: BlockTypeBadgeProps) => {
  const getTypeConfig = (type: BlockType) => {
    const configs = {
      "deep-work": {
        icon: Brain,
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Deep Work",
      },
      planning: {
        icon: CalendarDays,
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Planning",
      },
      break: {
        icon: Coffee,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Break",
      },
      admin: {
        icon: FileSpreadsheet,
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Admin",
      },
      collaboration: {
        icon: Users,
        bg: "bg-pink-100",
        text: "text-pink-800",
        label: "Collab",
      },
    };
    return configs[type];
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.slice(0, 1)}</span>
    </span>
  );
};

export default BlockTypeBadge;
