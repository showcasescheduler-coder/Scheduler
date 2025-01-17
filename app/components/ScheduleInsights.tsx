import React from "react";
import { Battery, Zap, Brain } from "lucide-react";

const ScheduleInsights = ({ insights }) => {
  const categories = [
    { icon: Battery, color: "green", description: insights[0] },
    { icon: Zap, color: "yellow", description: insights[1] },
    { icon: Brain, color: "purple", description: insights[2] },
  ];

  return (
    <div className="flex flex-col gap-2">
      {categories.map(({ icon: Icon, color, description }, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md bg-${color}-100`}>
            <Icon className={`h-3.5 w-3.5 text-${color}-600`} />
          </div>
          <p className="text-sm text-gray-600 line-clamp-1 flex-1">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ScheduleInsights;
