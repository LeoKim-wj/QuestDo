import * as Notifications from 'expo-notifications';
import { Task } from '../types/task';

// Configure how notifications appear
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

// Schedule a repeated notification for an unfinished task
export async function scheduleTaskReminder(task: Task) {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Unfinished Task Reminder',
      body: `Don't forget: ${task.title}`,
      data: { taskId: task.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3600, // remind every hour
      repeats: true,
    },
  });
  return id;
}

// Cancel a notification when a task is completed
export async function cancelTaskReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications (e.g. on app reset)
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}