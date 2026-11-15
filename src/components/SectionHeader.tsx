import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  count?: number;
  countVariant?: 'badge' | 'plain';
  actionLabel?: string;
  showActionChevron?: boolean;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  count,
  countVariant = 'badge',
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
        {count !== undefined ? (
          countVariant === 'badge' ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          ) : (
            <Text style={styles.plainCount}>({count})</Text>
          )
        ) : null}
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
  badge: {
    minWidth: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.labelSm,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.textSecondary,
  },
  plainCount: {
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
