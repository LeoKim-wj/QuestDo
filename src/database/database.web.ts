import { Task } from "../types/task";

const storageKey = "questdo.tasks";
let webTasks: Task[] = readStoredTasks();

export async function initializeDatabase() {
  webTasks = readStoredTasks();
}

export async function getTasks() {
  webTasks = readStoredTasks();
  return webTasks;
}

export async function insertTask(task: Task) {
  webTasks = [task, ...webTasks.filter((item) => item.id !== task.id)];
  writeStoredTasks(webTasks);
}

export async function updateTaskRecord(id: string, updatedFields: Partial<Task>) {
  webTasks = webTasks.map((task) =>
    task.id === id ? { ...task, ...updatedFields } : task
  );
  writeStoredTasks(webTasks);
}

export async function deleteTaskRecord(id: string) {
  webTasks = webTasks.filter((task) => task.id !== id);
  writeStoredTasks(webTasks);
}

export async function setTaskCompleted(id: string, completed: boolean) {
  webTasks = webTasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );
  writeStoredTasks(webTasks);
}

function readStoredTasks() {
  if (!hasLocalStorage()) {
    return [];
  }

  try {
    const rawTasks = globalThis.localStorage.getItem(storageKey);
    return rawTasks ? (JSON.parse(rawTasks) as Task[]) : [];
  } catch (error) {
    console.error("Failed to load web task storage", error);
    return [];
  }
}

function writeStoredTasks(tasks: Task[]) {
  if (!hasLocalStorage()) {
    return;
  }

  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save web task storage", error);
  }
}

function hasLocalStorage() {
  return (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage.getItem === "function" &&
    typeof globalThis.localStorage.setItem === "function"
  );
}
