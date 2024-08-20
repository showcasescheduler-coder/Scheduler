export interface Task {
  _id: string;
  name: string;
  description: string;
  priority: string;
  duration: string;
  deadline: string;
  status: "Todo" | "InProgress" | "Completed";
  block: string | null; // Allow block to be null
}

export interface ProjectTask extends Task {
  projectId: string;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  duration: string;
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
  time: string;
}

export interface Routine {
  _id: string;
  name: string;
  description: string;
  days: string[];
  tasks: RoutineTask[];
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
  status: "Todo" | "InProgress" | "Completed";
  startTime: string;
  endTime: string;
  tasks: Task[];
}

export interface Day {
  id: string;
  date: string;
  completed: boolean;
  blocks: (Block | string)[];
}
