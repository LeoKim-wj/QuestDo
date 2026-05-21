import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { TaskProvider } from '../src/context/TaskContext';

export const unstable_settings = {
  anchor: 'index',
};

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;
    let subscription: { remove: () => void } | undefined;

    import('expo-notifications').then((Notifications) => {
      if (!isMounted) return;
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const taskId = response.notification.request.content.data?.taskId as string | undefined;
        if (taskId) {
          router.push(`/edit?taskId=${taskId}`);
        }
      });
    }).catch(() => {});

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [router]);

  return null;
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const onLoginScreen = segments[0] === 'index';

    if (!user && !onLoginScreen) {
      router.replace('/');
    } else if (user && onLoginScreen) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <TaskProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <NotificationHandler />
          <AuthGuard />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="create" options={{ title: 'Add Task' }} />
            <Stack.Screen name="edit" options={{ title: 'Edit Task' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TaskProvider>
    </AuthProvider>
  );
}
