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
import { Clock } from "lucide-react";
import { useState } from "react";

interface BlockData {
  name: string;
  startTime: string;
  endTime: string;
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
  });

  const handleAddBlock = () => {
    if (!newBlock.name || !newBlock.startTime || !newBlock.endTime) {
      return; // Add validation if needed
    }
    onAddBlock(newBlock);
    setNewBlock({ name: "", startTime: "", endTime: "" }); // Reset form
    onOpenChange(false); // Close dialog
  };

  const handleClose = () => {
    setNewBlock({ name: "", startTime: "", endTime: "" }); // Reset form
    onOpenChange(false); // Close dialog
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
                Block Name
              </Label>
              <Input
                id="name"
                placeholder="Enter block name"
                value={newBlock.name}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, name: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  Start Time
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
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium">
                  End Time
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
                  className="h-9"
                />
              </div>
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
