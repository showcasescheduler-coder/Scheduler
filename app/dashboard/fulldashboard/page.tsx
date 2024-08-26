"use client";
import React, { use, useEffect, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { Block, Task, Day } from "@/app/context/models";
import { UserData } from "@/app/context/models";
import { AddTaskModal } from "@/dialog/addTaskModal";
import { AddEventModal } from "@/dialog/addEventModal";
import { AddRoutineModal } from "@/dialog/addRoutineModal";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Truck,
  PlusCircle,
  CheckCircle,
  Clock,
  Star,
  GripVertical,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTodayDay } from "@/hooks/useTodayDay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeBlock {
  description: string;
  startTime: string;
  endTime: string;
  Tasks: Task[];
}

interface ScheduleResponse {
  mainGoal: string;
  ObjectiveOne: string;
  ObjectiveTwo: string;
  Blocks: TimeBlock[];
}
const DashboardPage = () => {
  const { projects, events, routines, tasks, blocks, setBlocks, setDay } =
    useAppContext();
  const [aiResponse, setAiResponse] = useState<ScheduleResponse | null>(null);
  const { day, isLoading, isError, mutate } = useTodayDay();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const generateSchedule = async () => {
    const userInformation = {
      name: "John Doe", // You might want to get this from your user context
      projects: projects,
      stand_alone_tasks: tasks,
      routines: routines,
      events: events,
      // You might need to add historical_data if you have it in your app context
    };

    const rules = `
      My main goal should be a task that belongs to a project that has the highest priority
      My ObjectiveOne should be a task that belongs to from a project that has the highest priority or
      My ObjectiveTwo should be a task that belongs to a project that has the highest priority
      Please make sure tasks are grouped based on synergy and efficiency. For instance, smaller tasks could be grouped together in a single block to maximize productivity.
      Please take into consideration time tasks are likely to be the most effective. E.g Some tasks are better to be done in business hours
      Encourage the inclusion of stand-alone tasks, especially those with high priority or upcoming deadlines.
      break daily goals into smaller task where possible and appropriate based on its best judgment, but where it is unsure on how to break down any further then it shouldnt. 
      All scheduled tasks should belong to a time block with a descriptive name, start time, and end time.
      One or multiple tasks can be assigned to a block depending on time considerations.
      - Ensure that feedback from previous days (e.g., tasks that took longer than expected) is explicitly considered in the scheduling. This will help in adjusting the duration and order of tasks more effectively.
      - Also please prioritise tasks that were not completed yesterday as the user will likely want to carry on with that progress
      Consider task combinations, behavioral science, and travel time.
      Routines are time blocks with recurring tasks and should be added on their designated days but can be adjusted to meet the schedule.
      Tasks must be assigned to the main goal or objectives or as stand-alone tasks.
      8. Prioritize goals and tasks that were attempted and not completed the day before.
      9. Encourage combining multiple tasks into blocks for efficiency.
      10. Provide the schedule in the following format:
      {
          mainGoal: 
          ObjectiveOne:
          ObjectiveTwo:
          Blocks: [
              {
                  description:
                  startTime:
                  endTime:
                  Tasks:[
                      {
                          description: 
                          status:
                      }
                  ]
              }
          ]
      }
    `;

    const prompt = `Based on the following user information and rules, give me the most efficient schedule for tommorow using the user infromaton.  Return only the JSON object, with no additional text:\n\nUser Information: ${JSON.stringify(
      userInformation
    )}\n\nRules: ${rules}`;

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY in environment variables");
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedResponse: ScheduleResponse = JSON.parse(
        data.choices[0].message.content
      );
      setAiResponse(parsedResponse);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleAddBlock = async () => {
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayId: day._id,
          name: newBlock.name,
          startTime: newBlock.startTime,
          endTime: newBlock.endTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add block");
      }

      const addedBlock: Block = await response.json();

      // Update the day data using SWR's mutate function
      mutate(
        (currentDay: Day) => ({
          ...currentDay,
          blocks: [...currentDay.blocks, addedBlock],
        }),
        false
      );

      // Close the dialog and reset the form
      setIsDialogOpen(false);
      setNewBlock({ name: "", startTime: "", endTime: "" });
    } catch (error) {
      console.error("Error adding block:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleAddTaskToBlock = (task: Task) => {
    // if (selectedBlockId) {
    //   // Logic to add the task to the block
    //   // This might involve updating the day state and calling an API
    //   mutate(
    //     (currentDay: Day) => ({
    //       ...currentDay,
    //       blocks: currentDay.blocks.map((block) =>
    //         block._id === selectedBlockId
    //           ? { ...block, tasks: [...block.tasks, task] }
    //           : block
    //       ),
    //     }),
    //     false
    //   );
    // }
    setIsAddTaskModalOpen(false);
  };

  const handleAddRoutine = () => {
    setIsAddRoutineModalOpen(true);
  };

  const handleAddTask = (blockId: string) => {
    console.log("Adding task to block:", blockId);
    setSelectedBlockId(blockId);
    setIsAddTaskModalOpen(true);
  };
  const handleAddEvent = () => {
    setIsAddEventModalOpen(true);
  };

  const updateDay = () => {
    mutate();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading day data</div>;
  if (!day) return <div>No day data available</div>;
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  console.log("Day data:", day);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Daily Planner</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Generate your daily plan
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={generateSchedule}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Plan
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-4xl">15/20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              75% completion rate
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={75} aria-label="75% tasks completed" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Blocks Completed</CardDescription>
            <CardTitle className="text-4xl">6/8</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              2 blocks remaining
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={75} aria-label="75% time blocks completed" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Performance Score</CardDescription>
            <CardTitle className="text-4xl">8.5/10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Great performance today!
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={85} aria-label="85% performance score" />
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <div className="flex items-center mb-4">
          <TabsList>
            <TabsTrigger value="today">Active</TabsTrigger>
            <TabsTrigger value="week">Completed</TabsTrigger>
            <TabsTrigger value="month">All</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={handleAddRoutine}
              variant="outline"
              size="sm"
              className="h-7 gap-1"
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Routine
              </span>
            </Button>
            <Button
              onClick={handleAddEvent}
              size="sm"
              variant="outline"
              className="h-7 gap-1"
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Event
              </span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Block
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Block</DialogTitle>
                  <DialogDescription>
                    Create a new time block for your schedule.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newBlock.name}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, name: e.target.value })
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
                      value={newBlock.startTime}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, startTime: e.target.value })
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
                      value={newBlock.endTime}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, endTime: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddBlock}>
                    Add Block
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="today" className="space-y-4">
          {day &&
            day.blocks.map((blockOrString: Block | string, index: number) => {
              const block =
                typeof blockOrString === "string"
                  ? ({ _id: blockOrString } as Block)
                  : (blockOrString as Block);

              const isEventBlock = !!block.event;

              return (
                <Card key={block._id || index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>
                        {isEventBlock ? `Event: ${block.name}` : block.name}
                      </CardTitle>
                      <CardDescription>{`${block.startTime} - ${block.endTime}`}</CardDescription>
                    </div>
                    {isEventBlock ? (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800"
                      >
                        Event
                      </Badge>
                    ) : (
                      block.tasks &&
                      block.tasks.length > 0 && (
                        <Badge>{block.tasks[0].status}</Badge>
                      )
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEventBlock ? (
                      <div className="text-sm text-gray-600">
                        <Clock className="inline-block mr-2 h-4 w-4" />
                        {block.description || "No description available"}
                      </div>
                    ) : (
                      <>
                        <Progress value={50} className="h-2 mt-2 mb-4" />
                        <div className="space-y-2">
                          {block.tasks &&
                            block.tasks.map((task: Task, taskIndex: number) => (
                              <Card
                                key={task._id || taskIndex}
                                className="bg-muted relative"
                              >
                                <CardContent className="p-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <Checkbox
                                        id={`task-${task._id || taskIndex}`}
                                      />
                                    </div>
                                    <div>
                                      <label
                                        htmlFor={`task-${
                                          task._id || taskIndex
                                        }`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {task.name}
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {task.priority}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                      <span className="sr-only">
                                        Drag handle
                                      </span>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </>
                    )}
                    <div className="flex justify-end mt-4 space-x-2">
                      {!isEventBlock && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white"
                          onClick={() => handleAddTask(block._id)}
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Add Task</span>
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="icon"
                        className="bg-black text-white"
                        // onClick={() => handleCompleteBlock(block._id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">
                          Complete {isEventBlock ? "Event" : "Block"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
      {/* <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {tags.map((tag) => (
            <>
              <div key={tag} className="text-sm">
                {tag}
              </div>
              <Separator className="my-2" />
            </>
          ))}
        </div>
      </ScrollArea> */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTaskToBlock}
        blockId={selectedBlockId && selectedBlockId}
        updateDay={updateDay}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        blockId={selectedBlockId && selectedBlockId}
        updateDay={updateDay}
      />
      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        blockId={selectedBlockId && selectedBlockId}
        updateDay={updateDay}
      />
    </main>
  );
};

export default DashboardPage;
