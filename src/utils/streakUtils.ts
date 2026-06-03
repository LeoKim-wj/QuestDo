// Function: calculateStreak
// Purpose: Calculate how many days in a row the student completed at least one task

import { Task } from "../types/task";

// Function: getDateOnly
// Purpose: Convert a full date into YYYY-MM-DD format
function getDateOnly(dateValue: string) {
  return new Date(dateValue).toISOString().split("T")[0];
}

// Function: calculateStreak
// Purpose: Count consecutive days with at least one completed task
export function calculateStreak(tasks: Task[]) {
  const completedTaskDates = tasks
    .filter((task) => task.completed)
    .map((task) => getDateOnly(task.createdDate));

  const uniqueCompletedDates = Array.from(new Set(completedTaskDates));

  let streak = 0;
  const today = new Date();

  while (true) {
    const dateToCheck = new Date(today);
    dateToCheck.setDate(today.getDate() - streak);

    const formattedDate = dateToCheck.toISOString().split("T")[0];

    if (uniqueCompletedDates.includes(formattedDate)) {
      streak = streak + 1;
    } else {
      break;
    }
  }

  return streak;
}