import { createContext } from "react";
import { Task } from "../types/task";

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
};

export const TaskContext = createContext<TaskContextType | null>(null);
