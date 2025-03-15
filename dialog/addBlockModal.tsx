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
import { Block } from "@/app/context/models";

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
  onAddBlock: (blockData: Partial<Block>) => void; // Changed from Block to Partial<Block>
}

const initialBlockState: Partial<Block> = {
  name: "",
  startTime: "",
  endTime: "",
  description: "",
  blockType: "deep-work",
  status: "pending",
  event: null,
  tasks: [],
  meetingLink: "",
};

export function AddBlockDialog({
  isOpen,
  onOpenChange,
  onAddBlock,
}: AddBlockDialogProps) {
  const [newBlock, setNewBlock] = useState<Partial<Block>>(initialBlockState);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!newBlock.name?.trim()) {
      // Added optional chaining
      newErrors.name = "Block name is required";
      isValid = false;
    }

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
    setNewBlock(initialBlockState); // Use the constant we defined
    setErrors({});
    onOpenChange(false);
  };

  const getBlockTypeColor = (type: Block["blockType"]) => {
    // Use direct color hex values instead of Tailwind classes
    const colors = {
      "deep-work": "#9333ea", // purple-600 equivalent
      break: "#16a34a", // green-600 equivalent
      meeting: "#0284c7", // sky-600 equivalent
      health: "#0d9488", // teal-600 equivalent
      exercise: "#059669", // emerald-600 equivalent
      admin: "#4b5563", // gray-600 equivalent
      personal: "#c026d3", // fuchsia-600 equivalent
    };
    return colors[type];
  };

  return (
    <>
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
                  onValueChange={(value: Block["blockType"]) =>
                    setNewBlock({ ...newBlock, blockType: value })
                  }
                >
                  <SelectTrigger
                    className={`h-9 ${
                      errors.blockType ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select block type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep-work">
                      <span style={{ color: "#9333ea" }}>Deep Work</span>
                    </SelectItem>
                    <SelectItem value="break">
                      <span style={{ color: "#16a34a" }}>Break</span>
                    </SelectItem>
                    {/* <SelectItem value="meeting">
                      <span style={{ color: "#0284c7" }}>Meeting</span>
                    </SelectItem> */}
                    <SelectItem value="health">
                      <span style={{ color: "#0d9488" }}>Health</span>
                    </SelectItem>
                    <SelectItem value="personal">
                      <span style={{ color: "#c026d3" }}>Personal</span>
                    </SelectItem>
                    <SelectItem value="exercise">
                      <span style={{ color: "#059669" }}>Exercise</span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span style={{ color: "#4b5563" }}>Admin</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.blockType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.blockType}
                  </p>
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
                    className={`h-9 ${
                      errors.startTime ? "border-red-500" : ""
                    }`}
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
                    <p className="text-xs text-red-500 mt-1">
                      {errors.endTime}
                    </p>
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
      <div className="hidden">
        text-purple-600 text-green-600 text-blue-600 text-pink-600
        text-orange-600 text-gray-600 text-indigo-600 text-sky-600 text-teal-600
        text-emerald-600 text-fuchsia-600
      </div>
    </>
  );
}
