export interface Task {
  _id: string;
  name: string;
  description: string;
  priority: string;
  duration: number;
  deadline: string;
  isRoutineTask: boolean;
  completed: boolean;
  block: string | null; // Allow block to be null
  project: string | null; // Allow project to be null
  routine: string | null; // Allow routine to be
  projectId: string | null;
  type: "deep-work" | "planning" | "break" | "admin" | "collaboration"; //
}

export interface ProjectTask extends Task {
  projectId: string;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  block: string | null;
  priority: string;
  isRecurring: boolean;
  days: string[];
  meetingLink: string | null;
}

export interface Project {
  order: any;
  completed: boolean;
  _id: string;
  name: string;
  description: string;
  deadline: Date;
  time: string;
  priority: string;
  tasks: ProjectTask[];
}

export interface RoutineTask extends Task {
  routineId: string;
}

export interface Routine {
  _id: string;
  name: string;
  description: string;
  days: string[];
  tasks: RoutineTask[];
  block: string;
  startTime: string;
  endTime: string;
}

// New UserData interface
export interface UserData {
  tasks: Task[];
  projects: Project[];
  events: Event[];
  routines: Routine[];
}

export interface Block {
  _id: string;
  dayId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "pending" | "complete" | "incomplete";
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  event: string | null;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isStandaloneBlock?: boolean;
  meetingLink: string;
  routineId: string;
}

// export interface Block {
//   _id: string;
//   date: string;
//   name: string;
//   description: string;
//   status: "pending" | "complete" | "incomplete";
//   startTime: string;
//   endTime: string;
//   tasks: Task[];
//   event?: string; // Change this to a string (event ID) instead of Event[]
//   completed: boolean;
//   blockType:
//     | "deep-work"
//     | "break"
//     | "meeting"
//     | "health"
//     | "exercise"
//     | "admin"
//     | "personal";
// }

export interface Day {
  _id: string;
  date: string;
  completed: boolean;
  completedTasksCount: number;
  blocks: Block[]; // Remove the
}

export interface User {
  _id: string;
  email: string;
  name: string;
  days: Day[];
}

export interface Schedule {
  currentTime: string;
  scheduleRationale: string;
  userStartTime: string;
  userEndTime: string;
  blocks: Block[];
}

export interface PreviewTask {
  name: string;
  description: string;
  duration: number;
  priority: "High" | "Medium" | "Low";
  isRoutineTask: boolean;
}

export interface PreviewBlock {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  isEvent: boolean;
  isRoutine: boolean;
  isStandaloneBlock: boolean;
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  energyLevel: "high" | "medium" | "low";
  tasks: PreviewTask[];
}

export interface PreviewSchedule {
  currentTime: string;
  scheduleRationale: string;
  userStartTime: string;
  userEndTime: string;
  blocks: PreviewBlock[];
}
