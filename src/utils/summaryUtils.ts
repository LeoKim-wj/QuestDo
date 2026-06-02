import { Task } from "../types/task";

// Function: getWeeklySummary
export function getWeeklySummary(tasks: Task[]) {
  const today = new Date();

  return tasks.filter((task) => {
    const taskDate = new Date(task.createdDate);

    const differenceInTime =
      today.getTime() - taskDate.getTime();

    const differenceInDays =
      differenceInTime / (1000 * 60 * 60 * 24);

    return task.completed && differenceInDays <= 7;
  });
}

// Function: getMonthlySummary
export function getMonthlySummary(tasks: Task[]) {
  const today = new Date();

  return tasks.filter((task) => {
    const taskDate = new Date(task.createdDate);

    return (
      task.completed &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });
}

// Function: getSemesterSummary
export function getSemesterSummary(tasks: Task[]) {
  return tasks.filter((task) => task.completed);
}