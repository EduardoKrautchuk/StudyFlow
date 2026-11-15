import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { StudyDataProvider } from '@/hooks/use-study-data';

export default function AppLayout() {
  return (
    <StudyDataProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activity/new" />
        <Stack.Screen name="subject-form" />
      </Stack>
    </StudyDataProvider>
  );
}
