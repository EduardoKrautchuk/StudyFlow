import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  count?: number;
  actionLabel?: string;
  showActionChevron?: boolean;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  count,
  actionLabel,
  showActionChevron = false,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {count !== undefined ? <Text style={styles.count}>({count})</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="link" hitSlop={8} onPress={onAction} style={styles.action}>
          {({ pressed }) => (
            <>
              <Text style={[styles.actionText, pressed && styles.actionPressed]}>{actionLabel}</Text>
              {showActionChevron ? <ChevronRight size={16} color={colors.primary} strokeWidth={2} /> : null}
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 19,
    color: colors.text,
  },
  count: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    ...typography.labelMd,
    fontSize: 14,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.primary,
  },
  actionPressed: {
    opacity: 0.6,
  },
});
