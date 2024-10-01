import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Block } from "@/app/context/models";

interface EditBlockDialogProps {
  block: Block;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlock: Block) => void;
}

export const EditBlockDialog: React.FC<EditBlockDialogProps> = ({
  block,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedBlock, setEditedBlock] = useState(block);

  const handleSave = () => {
    onSave(editedBlock);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Block</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editedBlock.name}
              onChange={(e) =>
                setEditedBlock({ ...editedBlock, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={editedBlock.startTime}
              onChange={(e) =>
                setEditedBlock({ ...editedBlock, startTime: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={editedBlock.endTime}
              onChange={(e) =>
                setEditedBlock({ ...editedBlock, endTime: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
