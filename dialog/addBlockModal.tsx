"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useState } from "react";

interface BlockData {
  name: string;
  startTime: string;
  endTime: string;
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";

  description?: string;
}

interface ValidationErrors {
  name?: string;
  startTime?: string;
  endTime?: string;
  blockType?: string;
  timeRange?: string;
  meetingLink?: string;
}

interface AddBlockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (blockData: BlockData) => void;
}

export function AddBlockDialog({
  isOpen,
  onOpenChange,
  onAddBlock,
}: AddBlockDialogProps) {
  const [newBlock, setNewBlock] = useState<BlockData>({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
    blockType: "deep-work",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Name validation
    if (!newBlock.name.trim()) {
      newErrors.name = "Block name is required";
      isValid = false;
    }

    // Time validation
    if (!newBlock.startTime) {
      newErrors.startTime = "Start time is required";
      isValid = false;
    }

    if (!newBlock.endTime) {
      newErrors.endTime = "End time is required";
      isValid = false;
    }

    // Block type validation
    if (!newBlock.blockType) {
      newErrors.blockType = "Block type is required";
      isValid = false;
    }

    // Time range validation
    if (newBlock.startTime && newBlock.endTime) {
      const start = new Date(`2000/01/01 ${newBlock.startTime}`);
      const end = new Date(`2000/01/01 ${newBlock.endTime}`);

      if (end <= start) {
        newErrors.timeRange = "End time must be after start time";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddBlock = () => {
    if (validateForm()) {
      onAddBlock(newBlock);
      handleClose();
    }
  };

  const handleClose = () => {
    setNewBlock({
      name: "",
      startTime: "",
      endTime: "",
      blockType: "deep-work",
      description: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const getBlockTypeColor = (type: BlockData["blockType"]) => {
    const colors = {
      "deep-work": "text-purple-600",
      break: "text-green-600",
      meeting: "text-blue-600",
      health: "text-pink-600",
      exercise: "text-orange-600",
      admin: "text-gray-600",
      personal: "text-indigo-600",
    };
    return colors[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border rounded-lg shadow-lg">
        <div className="space-y-4">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <DialogTitle className="text-base font-medium">
                Add New Block
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Create a new time block for your schedule.
            </DialogDescription>
          </div>

          <div className="px-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Block Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter block name"
                value={newBlock.name}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, name: e.target.value })
                }
                className={`h-9 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockType" className="text-sm font-medium">
                Block Type *
              </Label>
              <Select
                value={newBlock.blockType}
                onValueChange={(value: BlockData["blockType"]) =>
                  setNewBlock({ ...newBlock, blockType: value })
                }
              >
                <SelectTrigger
                  className={`h-9 ${errors.blockType ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select block type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deep-work">
                    <span className={getBlockTypeColor("deep-work")}>
                      Deep Work
                    </span>
                  </SelectItem>
                  <SelectItem value="break">
                    <span className={getBlockTypeColor("break")}>Break</span>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <span className={getBlockTypeColor("meeting")}>
                      Meeting
                    </span>
                  </SelectItem>
                  <SelectItem value="health">
                    <span className={getBlockTypeColor("health")}>Health</span>
                  </SelectItem>
                  <SelectItem value="exercise">
                    <span className={getBlockTypeColor("exercise")}>
                      Exercise
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className={getBlockTypeColor("admin")}>Admin</span>
                  </SelectItem>
                  <SelectItem value="personal">
                    <span className={getBlockTypeColor("personal")}>
                      Personal
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.blockType && (
                <p className="text-xs text-red-500 mt-1">{errors.blockType}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newBlock.startTime}
                  onChange={(e) =>
                    setNewBlock({
                      ...newBlock,
                      startTime: e.target.value,
                    })
                  }
                  className={`h-9 ${errors.startTime ? "border-red-500" : ""}`}
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newBlock.endTime}
                  onChange={(e) =>
                    setNewBlock({
                      ...newBlock,
                      endTime: e.target.value,
                    })
                  }
                  className={`h-9 ${errors.endTime ? "border-red-500" : ""}`}
                />
                {errors.endTime && (
                  <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
            {errors.timeRange && (
              <p className="text-xs text-red-500 mt-1">{errors.timeRange}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Enter description (optional)"
                value={newBlock.description}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, description: e.target.value })
                }
                className="h-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 px-6 py-4 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleAddBlock}
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            Add Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
