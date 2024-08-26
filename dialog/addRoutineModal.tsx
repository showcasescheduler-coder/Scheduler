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
import { PlusCircle, CheckCircle, Circle } from "lucide-react";
import { Routine, Task } from "@/app/context/models";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/app/context/AppContext";

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

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch("/api/routines");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Routine to Schedule</DialogTitle>
        </DialogHeader>
        {!selectedRoutine ? (
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4 space-y-4">
              {routines.map((routine) => (
                <Card
                  key={routine._id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRoutineSelect(routine)}
                >
                  <CardContent className="p-3">
                    <h4 className="text-sm font-medium">{routine.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {routine.description}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {routine.tasks.map((task: Task) => (
                        <li key={task._id} className="flex items-start text-xs">
                          <Circle className="h-2 w-2 mr-2 mt-1 text-muted-foreground" />
                          <span>{task.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Set Time for Routine</h3>
            <p className="text-sm text-muted-foreground">
              Selected Routine:{" "}
              <span className="font-medium">{selectedRoutine.name}</span>
            </p>
            <ul className="text-sm space-y-1 mb-4">
              {selectedRoutine.tasks.map((task: Task) => (
                <li key={task._id} className="flex items-start">
                  <Circle className="h-2 w-2 mr-2 mt-1 text-muted-foreground" />
                  <span>{task.name}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">
                Start Time
              </label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">
                End Time
              </label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          {selectedRoutine ? (
            <>
              <Button
                variant="outline"
                onClick={() => setSelectedRoutine(null)}
              >
                Back
              </Button>
              <Button
                onClick={handleAddRoutineToSchedule}
                disabled={!startTime || !endTime}
              >
                Add to Schedule
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
