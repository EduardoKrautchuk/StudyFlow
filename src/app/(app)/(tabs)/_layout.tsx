import { Tabs } from 'expo-router/js-tabs';
import { BookOpen, CalendarDays, House, ListChecks } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Matérias',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
