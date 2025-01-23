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
import { PlusCircle, CheckCircle, Circle, Repeat } from "lucide-react";
import { Routine, Task } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const { day } = useAppContext();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

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

  const handleAddRoutineToSchedule = async () => {
    if (!selectedRoutine || !startTime || !endTime) return;

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
        }),
      });

      if (!response.ok) throw new Error("Failed to add routine to schedule");

      const data = await response.json();
      console.log("Routine added to schedule:", data);

      updateDay();
      onClose();
    } catch (error) {
      console.error("Error adding routine to schedule:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0">
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
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRoutineSelect(routine)}
                  >
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium">{routine.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {routine.description}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {routine.tasks.map((task: Task) => (
                          <li
                            key={task._id}
                            className="flex items-start text-xs text-gray-600"
                          >
                            <Circle className="h-2 w-2 mr-2 mt-1 text-gray-400" />
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
            <div className="space-y-1 pb-3 border-b">
              <h3 className="text-sm font-medium">{selectedRoutine.name}</h3>
              <ul className="mt-2 space-y-1.5">
                {selectedRoutine.tasks.map((task: Task) => (
                  <li
                    key={task._id}
                    className="flex items-start text-xs text-gray-600"
                  >
                    <Circle className="h-2 w-2 mr-2 mt-1 text-gray-400" />
                    <span>{task.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
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
        )}

        <div className="p-4 border-t flex justify-end gap-2">
          {selectedRoutine ? (
            <>
              <Button
                variant="outline"
                onClick={() => setSelectedRoutine(null)}
                className="h-8"
              >
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
