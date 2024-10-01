"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Event,
  Project,
  ProjectTask,
  Task,
  Routine,
  RoutineTask,
  UserData,
  Day,
  Block,
} from "./models";

type AppContextType = {
  events: Event[];
  day: Day;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  addBlock: (block: Block) => void;
  updateBlock: (id: string, block: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  setDay: React.Dispatch<React.SetStateAction<Day>>;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTaskToProject: (projectId: string, task: ProjectTask) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  addTaskToRoutine: (
    routineId: string,
    task: Omit<RoutineTask, "id" | "routineId">
  ) => void;
  updateRoutineTask: (
    routineId: string,
    taskId: string,
    task: Partial<RoutineTask>
  ) => void;
  deleteRoutineTask: (routineId: string, taskId: string) => void;
  routines: Routine[];
  userData: UserData;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [day, setDay] = useState<Day>({
    _id: "",
    date: "",
    completed: false,
    blocks: [],
    completedTasksCount: 0,
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userData, setUserData] = useState<UserData>({
    tasks: [],
    projects: [],
    events: [],
    routines: [],
  });

  const addEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event._id === id ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event._id !== id));
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [...prev, project]);
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project._id === id ? { ...project, ...updatedProject } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project._id !== id));
  };

  const addTaskToProject = (projectId: string, task: ProjectTask) => {
    setProjects((prev) =>
      prev.map((project) =>
        project._id === projectId
          ? { ...project, tasks: [...project.tasks, task] }
          : project
      )
    );
  };

  // Task functions
  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? { ...task, ...updatedTask } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task._id !== id));
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  const updateRoutine = (id: string, updatedRoutine: Partial<Routine>) => {
    setRoutines((prev) =>
      prev.map((routine) =>
        routine._id === id ? { ...routine, ...updatedRoutine } : routine
      )
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((routine) => routine._id !== id));
  };

  const addTaskToRoutine = (
    routineId: string,
    task: Omit<RoutineTask, "id" | "routineId">
  ) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine._id === routineId) {
          const newTask: RoutineTask = {
            // _id: Date.now().toString(),
            routineId,
            ...task,
          };
          return { ...routine, tasks: [...routine.tasks, newTask] };
        }
        return routine;
      })
    );
  };

  const updateRoutineTask = (
    routineId: string,
    taskId: string,
    updatedTask: Partial<RoutineTask>
  ) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine._id === routineId) {
          const updatedTasks = routine.tasks.map((task) =>
            task._id === taskId ? { ...task, ...updatedTask } : task
          );
          return { ...routine, tasks: updatedTasks };
        }
        return routine;
      })
    );
  };

  const deleteRoutineTask = (routineId: string, taskId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine._id === routineId) {
          const updatedTasks = routine.tasks.filter(
            (task) => task._id !== taskId
          );
          return { ...routine, tasks: updatedTasks };
        }
        return routine;
      })
    );
  };

  const addBlock = (block: Block) => {
    setBlocks((prev) => [...prev, block]);
    setDay((prevDay) => ({
      ...prevDay,
      blocks: [...prevDay.blocks, block._id],
    }));
  };

  const updateBlock = (id: string, updatedBlock: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block._id === id ? { ...block, ...updatedBlock } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block._id !== id));
    setDay((prevDay) => ({
      ...prevDay,
      blocks: prevDay.blocks.filter((blockId) => blockId !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        day,
        setDay,
        userData,
        routines,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        projects,
        addProject,
        updateProject,
        deleteProject,
        addTaskToProject,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        addTaskToRoutine,
        updateRoutineTask,
        deleteRoutineTask,
        setProjects,
        setEvents,
        setTasks,
        setRoutines,
        blocks,
        setBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
