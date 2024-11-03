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
}

export interface Project {
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
  date: string;
  name: string;
  description: string;
  status: "pending" | "complete" | "incomplete";
  startTime: string;
  endTime: string;
  tasks: Task[];
  event?: string; // Change this to a string (event ID) instead of Event[]
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
