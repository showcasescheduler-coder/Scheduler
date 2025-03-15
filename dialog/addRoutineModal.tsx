"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  CheckCircle,
  Circle,
  Repeat,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Routine, Task } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  timeToMinutes,
  isTimeWithinRange,
  doTimesOverlap,
  validateTimeRange,
} from "@/helpers/timeValidation";
import toast from "react-hot-toast";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string | null;
  updateDay: () => void;
}

export const AddRoutineModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  updateDay,
}) => {
  const { day, selectedDay } = useAppContext();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { isPreviewMode, setPreviewSchedule, previewSchedule } =
    useAppContext();

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch(`/api/routines?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch routines");
      }
      const data = await res.json();
      setRoutines(data);
    } catch (error) {
      console.error("Error fetching routines:", error);
    }
  };

  const handleRoutineSelect = (routine: Routine) => {
    setSelectedRoutine(routine);
    setStartTime("");
    setEndTime("");
  };

  // Add this to AddRoutineModal
  const roundToNearestHalfHour = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 30) * 30;
    let finalHours = hours;
    let finalMinutes = roundedMinutes;
    if (roundedMinutes === 60) {
      finalHours = (hours + 1) % 24;
      finalMinutes = 0;
    }
    return `${String(finalHours).padStart(2, "0")}:${String(
      finalMinutes
    ).padStart(2, "0")}`;
  };

  const getScheduleTimes = (
    selectedDay: "today" | "tomorrow"
  ): { startTime: string; endTime: string } => {
    const endTime = "23:59";
    if (selectedDay === "today") {
      const currentTime = new Date();
      return {
        startTime: roundToNearestHalfHour(currentTime),
        endTime,
      };
    } else {
      return {
        startTime: "08:00",
        endTime,
      };
    }
  };

  const { startTime: allowedStart, endTime: allowedEnd } =
    getScheduleTimes(selectedDay);

  const handleAddRoutineToSchedule = async () => {
    if (!selectedRoutine || !startTime || !endTime) return;

    // Validate the routine's start and end times
    const routineTime = { startTime, endTime };
    const errorMessage = validateTimeRange(
      routineTime,
      isPreviewMode ? previewSchedule?.blocks || [] : day.blocks,
      allowedStart,
      allowedEnd
    );
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    if (isPreviewMode) {
      try {
        // Get current preview schedule
        const previewSchedule = JSON.parse(
          localStorage.getItem("schedule") ||
            JSON.stringify({
              currentTime: new Date().toLocaleTimeString(),
              scheduleRationale: "",
              userStartTime: "",
              userEndTime: "",
              blocks: [],
            })
        );

        // Create temporary block ID
        const tempBlockId = `temp-block-${previewSchedule.blocks.length}`;

        // Create temporary task IDs and tasks
        const tempTasks = selectedRoutine.tasks.map((task, index) => ({
          _id: `temp-task-${tempBlockId}-${index}`,
          name: task.name,
          priority: task.priority,
          duration: task.duration,
          block: tempBlockId,
          blockId: tempBlockId,
          routineId: selectedRoutine._id,
          isRoutineTask: true,
          completed: false,
          description: task.description || "",
          status: "pending",
          type: task.type || "deep-work",
        }));

        // Create the block for the routine
        const newBlock = {
          _id: tempBlockId,
          name: selectedRoutine.name,
          startTime,
          endTime,
          status: "pending",
          blockType: selectedRoutine.blockType || "deep-work",
          description: selectedRoutine.description || "",
          routineId: selectedRoutine._id,
          tasks: tempTasks,
          isRoutine: true,
        };

        // Add block to schedule
        const updatedBlocks = [...previewSchedule.blocks, newBlock];
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        // Save to localStorage
        localStorage.setItem("schedule", JSON.stringify(updatedSchedule));

        // Update UI state
        setPreviewSchedule(updatedSchedule);
        toast.success("Routine added to preview schedule");
        onClose();
      } catch (error) {
        console.error("Error adding routine in preview mode:", error);
        toast.error("Failed to add routine to preview");
      }
    } else {
      try {
        const response = await fetch("/api/routines/add-to-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayId: day._id,
            routineId: selectedRoutine._id,
            name: selectedRoutine.name,
            startTime,
            endTime,
            tasks: selectedRoutine.tasks,
            blockType: selectedRoutine.blockType || "personal",
          }),
        });

        if (!response.ok) throw new Error("Failed to add routine to schedule");

        const data = await response.json();
        updateDay();
        onClose();
      } catch (error) {
        console.error("Error adding routine to schedule:", error);
        toast.error("Failed to add routine to schedule");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 rounded-lg shadow-md">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-blue-600" />
            <DialogTitle className="text-base font-medium">
              {selectedRoutine ? "Set Routine Time" : "Add Routine"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!selectedRoutine ? (
          <ScrollArea className="h-[400px] border-t border-b">
            <div className="p-6 space-y-3">
              {routines.length > 0 ? (
                routines.map((routine) => (
                  <Card
                    key={routine._id}
                    className="cursor-pointer hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
                    onClick={() => handleRoutineSelect(routine)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{routine.name}</h4>
                        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 flex items-center px-2 py-0.5">
                          <CheckCircle className="h-2.5 w-2.5 mr-1" />
                          <span>
                            {routine.tasks.length}{" "}
                            {routine.tasks.length === 1 ? "task" : "tasks"}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {routine.description}
                      </p>
                      {/* Add type indicator */}
                      <div className="flex items-center mt-2">
                        <div
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{
                            backgroundColor:
                              routine.blockType === "deep-work"
                                ? "#9333ea" // purple-600
                                : routine.blockType === "break"
                                ? "#16a34a" // green-600
                                : routine.blockType === "meeting"
                                ? "#0284c7" // sky-600
                                : routine.blockType === "health"
                                ? "#0d9488" // teal-600
                                : routine.blockType === "exercise"
                                ? "#059669" // emerald-600
                                : routine.blockType === "admin"
                                ? "#4b5563" // gray-600
                                : routine.blockType === "personal"
                                ? "#c026d3" // fuchsia-600
                                : "#9333ea", // Default (purple-600)
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 capitalize">
                          {(routine.blockType || "deep-work").replace("-", " ")}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {routine.tasks.map((task: Task) => (
                          <li
                            key={task._id}
                            className="flex items-start text-xs text-gray-600"
                          >
                            <Circle className="h-3 w-3 mr-2 mt-0.5 text-blue-500 fill-blue-500" />
                            <span>{task.name}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] px-6">
                  <div className="rounded-full bg-blue-50 p-3 mb-4">
                    <Repeat className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    No routines yet
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Create your first routine to add it to your schedule
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/routines")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create a Routine
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 space-y-4">
            <div className="space-y-2 pb-3 border-b">
              <h3 className="text-sm font-medium text-gray-800">
                {selectedRoutine.name}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedRoutine.description}
              </p>

              {/* Add type indicator */}
              <div className="flex items-center mt-2">
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor:
                      selectedRoutine.blockType === "deep-work"
                        ? "#9333ea" // purple-600
                        : selectedRoutine.blockType === "break"
                        ? "#16a34a" // green-600
                        : selectedRoutine.blockType === "meeting"
                        ? "#0284c7" // sky-600
                        : selectedRoutine.blockType === "health"
                        ? "#0d9488" // teal-600
                        : selectedRoutine.blockType === "exercise"
                        ? "#059669" // emerald-600
                        : selectedRoutine.blockType === "admin"
                        ? "#4b5563" // gray-600
                        : selectedRoutine.blockType === "personal"
                        ? "#c026d3" // fuchsia-600
                        : "#9333ea", // Default (purple-600)
                  }}
                ></div>
                <span className="text-xs text-gray-500 capitalize">
                  Block Type:{" "}
                  {(selectedRoutine.blockType || "deep-work").replace("-", " ")}
                </span>
              </div>

              <ul className="mt-3 space-y-2 pb-2">
                {selectedRoutine.tasks.map((task: Task) => (
                  <li
                    key={task._id}
                    className="flex items-start text-xs bg-gray-50 p-2 rounded"
                  >
                    <Circle className="h-3 w-3 mr-2 mt-0.5 text-blue-500 fill-blue-500" />
                    <span className="text-gray-700">{task.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <div className="flex items-center mb-3 text-sm text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Set time for this routine</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Start</label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">End</label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          {selectedRoutine ? (
            <>
              <Button
                variant="outline"
                onClick={() => setSelectedRoutine(null)}
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={handleAddRoutineToSchedule}
                disabled={!startTime || !endTime}
                className="h-8 bg-blue-600 hover:bg-blue-700"
              >
                Add to Schedule
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="h-8">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
