import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { colors, spacing } from '@/constants/theme';

type ComingSoonProps = {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
};

export function ComingSoon({ icon, title, action }: ComingSoonProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <EmptyState
          icon={icon}
          title={title}
          message="Esta tela ainda está em construção e será liberada nas próximas etapas."
          action={action}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
});
