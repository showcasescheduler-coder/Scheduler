import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  PauseCircle,
  PlayCircle,
  BellRing,
  BellOff,
  Minimize2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

interface Block {
  _id: string;
  dayId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "pending" | "complete" | "incomplete";
  blockType: "deep-work" | "planning" | "break" | "admin" | "collaboration";
  event: string | null;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isStandaloneBlock?: boolean;
  meetingLink?: string;
}

interface FocusSessionProps {
  block: Block;
  onClose: () => void;
}

const FocusSession: React.FC<FocusSessionProps> = ({ block, onClose }) => {
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(25 * 60);
  const [notes, setNotes] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);

  const completedTasks = block.tasks.filter((t) => t.completed).length;
  const progress = (completedTasks / block.tasks.length) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <div className="flex flex-col h-[480px]">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{block.name}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {block.startTime} - {block.endTime}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotifications(!notifications)}
                  className="h-8 w-8"
                >
                  {notifications ? (
                    <BellRing className="h-4 w-4 text-gray-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <Minimize2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {/* Timer Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl font-mono font-medium text-gray-700">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTimerActive(!isTimerActive)}
                    className="h-8"
                  >
                    {isTimerActive ? (
                      <>
                        <PauseCircle className="h-4 w-4 mr-1.5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1.5" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Timer className="h-4 w-4 mr-1.5" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Tasks Section */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks</h3>
              <div className="space-y-2">
                {block.tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium text-sm truncate ${
                              task.completed ? "text-gray-500 line-through" : ""
                            }`}
                          >
                            {task.name}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {task.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Session Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes for this session..."
                className="w-full h-24 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FocusSession;
