import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { cosmeticItems } from '@/src/rewards/cosmeticItems';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { TaskProvider, useTasks } from '../src/context/TaskContext';

export const unstable_settings = {
  anchor: 'index',
};

function CosmeticUnlockModal() {
  const { newlyUnlockedCosmeticId, clearNewlyUnlocked } = useTasks();
  const router = useRouter();

  const unlockedItem = cosmeticItems.find((item) => item.id === newlyUnlockedCosmeticId);

  return (
    <Modal
      visible={!!unlockedItem}
      transparent
      animationType="fade"
      onRequestClose={clearNewlyUnlocked}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.header}>New Cosmetic Unlocked! 🎉</Text>
          <Text style={modalStyles.emoji}>{unlockedItem?.emoji}</Text>
          <Text style={modalStyles.name}>{unlockedItem?.name}</Text>
          <Text style={modalStyles.description}>{unlockedItem?.description}</Text>
          <TouchableOpacity
            style={modalStyles.primaryButton}
            onPress={() => {
              clearNewlyUnlocked();
              router.push('/(tabs)/cosmetics');
            }}
          >
            <Text style={modalStyles.primaryButtonText}>View Cosmetics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.secondaryButton} onPress={clearNewlyUnlocked}>
            <Text style={modalStyles.secondaryButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a008a',
    marginBottom: 16,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 56,
    lineHeight: 68,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#8a008a',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#8a008a',
    fontSize: 14,
  },
});

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

    const publicAuthScreens = ['index', 'signup', 'forgot-password'];
    const onPublicAuthScreen = publicAuthScreens.includes(segments[0] ?? 'index');

    if (!user && !onPublicAuthScreen) {
      router.replace('/');
    } else if (user && onPublicAuthScreen) {
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
          <CosmeticUnlockModal />
          <NotificationHandler />
          <AuthGuard />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
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
