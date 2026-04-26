import { Task } from "../types/task";
 
export function createTask(title: string): Task {
  return {
    id: Date.now().toString(),
    title,
    completed: false,
  };
}

export function completeTask(task: Task): Task {
  return { ...task, completed: true };
}