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
  isCustomDuration: boolean;
  routineId: string;
  eventId: string;
}

export interface ProjectTask extends Task {
  projectId: string;
}

export interface EventTask extends Task {
  eventId: string;
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
  tasks: EventTask[];
  eventType: string;
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
  blockType: string;
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
  eventId: string;
  _eventData: string;
}

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
  blocks: {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    description: string;
    type:
      | "deep-work"
      | "break"
      | "meeting"
      | "health"
      | "exercise"
      | "admin"
      | "personal";
    routineId: string | null;
    tasks: {
      id: string | null;
      name: string;
      duration: number;
      projectId: string | null;
      routineId: string | null;
      eventId: string | null;
    }[];
  }[];
}

export interface PreviewTask {
  id: string | null;
  name: string;
  duration: number;
  projectId: string | null;
  routineId: string | null;
  eventId: string | null;
  description?: string;
  priority?: "High" | "Medium" | "Low";
  isRoutineTask?: boolean;
}

export interface PreviewBlock {
  event: string;
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  isEvent: boolean;
  isRoutine: boolean;
  isStandaloneBlock: boolean;
  eventId: string | null; // Add this line
  blockType:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  energyLevel: "high" | "medium" | "low";
  type:
    | "deep-work"
    | "break"
    | "meeting"
    | "health"
    | "exercise"
    | "admin"
    | "personal";
  routineId: string | null;
  tasks: PreviewTask[];
}

export interface PreviewSchedule {
  currentTime: string;
  scheduleRationale: string;
  userStartTime: string;
  userEndTime: string;
  blocks: PreviewBlock[];
}
