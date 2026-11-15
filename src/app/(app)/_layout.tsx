import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { useActivityReminders } from '@/hooks/use-activity-reminders';
import { StudyDataProvider } from '@/hooks/use-study-data';

function AppStack() {
  useActivityReminders();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity-form" />
      <Stack.Screen name="subject-form" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <StudyDataProvider>
      <AppStack />
    </StudyDataProvider>
  );
}
