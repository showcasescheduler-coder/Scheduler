import React from "react";

interface Task {
  _id: string;
  block: string;
  dayId: string;
  name: string;
  description: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "in_progress" | "completed";
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  isRoutineTask: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BlockProgressProps {
  tasks: Task[];
}

const BlockProgress: React.FC<BlockProgressProps> = ({ tasks }) => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex-1 flex items-center justify-center gap-2 ">
      <div className="w-32 md:w-96 flex items-center gap-2">
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlockProgress;
