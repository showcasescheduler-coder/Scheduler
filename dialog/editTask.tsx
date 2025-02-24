import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Task, PreviewSchedule } from "@/app/context/models";
import { useAppContext } from "@/app/context/AppContext";
import toast from "react-hot-toast";

interface EditTaskDialogProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  isPreviewMode: boolean;
}

const updatePreviewStorage = (updatedSchedule: PreviewSchedule) => {
  localStorage.setItem("schedule", JSON.stringify(updatedSchedule));
};

export function EditTaskDialog({
  task,
  onClose,
  onSave,
  isPreviewMode,
}: EditTaskDialogProps) {
  const { setPreviewSchedule } = useAppContext();
  const [formData, setFormData] = React.useState<Task>(task);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSave(formData);
  //   onClose();
  // };

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

        // Find the block containing the task
        const blockIndex = previewSchedule.blocks.findIndex((block: any) => {
          return block.tasks.some((t: Task) => t._id === task._id);
        });

        if (blockIndex === -1) {
          console.error("Could not find block containing task");
          toast.error("Failed to update task: Could not find containing block");
          return;
        }

        // Create a new blocks array
        const updatedBlocks = [...previewSchedule.blocks];

        // Update the specific task in its block
        updatedBlocks[blockIndex] = {
          ...updatedBlocks[blockIndex],
          tasks: updatedBlocks[blockIndex].tasks.map((t: Task) => {
            if (t._id === task._id) {
              // Preserve the task's _id and any other necessary fields
              return {
                ...formData,
                _id: task._id,
                block: updatedBlocks[blockIndex]._id,
                blockId: updatedBlocks[blockIndex]._id,
              };
            }
            return t;
          }),
        };

        // Create updated schedule
        const updatedSchedule = {
          ...previewSchedule,
          blocks: updatedBlocks,
        };

        console.log("Updating task in preview mode:", {
          originalTask: task,
          updatedTask: formData,
          blockFound: updatedBlocks[blockIndex],
          updatedSchedule,
        });

        // Save to localStorage
        localStorage.setItem("schedule", JSON.stringify(updatedSchedule));

        // Update UI state
        setPreviewSchedule(updatedSchedule);
        toast.success("Task updated in preview");
      } catch (error) {
        console.error("Error updating task in preview mode:", error);
        toast.error("Failed to update task in preview mode");
      }
    } else {
      try {
        // Ensure we have all required fields
        if (!formData.name || !formData.duration) {
          toast.error("Please fill in all required fields");
          return;
        }

        await onSave(formData);
        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Error saving task:", error);
        toast.error("Failed to save task changes");
        return;
      }
    }

    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Task Name</Label>
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
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deep-work">Deep Work</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
            </SelectContent>
          </Select>
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
