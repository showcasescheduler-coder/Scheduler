import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Block, PreviewSchedule } from "@/app/context/models";
import { useAppContext } from "@/app/context/AppContext";

// Define a type for the editable fields
interface EditableBlockFields {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  status: "pending" | "complete" | "incomplete";
  meetingLink?: string;
}

// Create a form data type that includes only the fields we want to edit
interface BlockFormData extends Block {
  _id: string;
}

interface EditBlockDialogProps {
  block: Block;
  onClose: () => void;
  onSave: (updatedBlock: Block) => void;
  isPreviewMode: boolean;
}

export function EditBlockDialog({
  block,
  onClose,
  onSave,
  isPreviewMode,
}: EditBlockDialogProps) {
  const { setPreviewSchedule } = useAppContext();
  // Initialize form data with only the fields we want to edit
  const [formData, setFormData] = React.useState<EditableBlockFields>({
    _id: block._id,
    name: block.name,
    startTime: block.startTime,
    endTime: block.endTime,
    description: block.description,
    blockType: block.blockType,
    status: block.status,
    meetingLink: block.meetingLink,
  });

  const updatePreviewStorage = (updatedSchedule: PreviewSchedule) => {
    localStorage.setItem("schedule", JSON.stringify(updatedSchedule));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

        // Update the block in the schedule
        const updatedBlocks = previewSchedule.blocks.map((b: Block) => {
          if (b._id === block._id) {
            return {
              ...b,
              ...formData,
            };
          }
          return b;
        });

        // Create updated schedule
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        // Save to localStorage
        updatePreviewStorage(updatedSchedule);

        // Update UI state
        setPreviewSchedule(updatedSchedule);
      } catch (error) {
        console.error("Error updating block in preview mode:", error);
      }
    } else {
      // Existing database logic
      const updatedBlock: Block = {
        ...block,
        ...formData,
      };
      onSave(updatedBlock);
    }

    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Block</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Block Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blockType">Block Type</Label>
          <select
            id="blockType"
            name="blockType"
            value={formData.blockType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="deep-work">Deep Work</option>
            <option value="planning">Planning</option>
            <option value="break">Break</option>
            <option value="admin">Admin</option>
            <option value="collaboration">Collaboration</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
          <Input
            id="meetingLink"
            name="meetingLink"
            type="url"
            value={formData.meetingLink || ""}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </>
  );
}
