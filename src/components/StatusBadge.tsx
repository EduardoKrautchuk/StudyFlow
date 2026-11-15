import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { withAlpha } from '@/utils/color';

export type BadgeTone = 'error' | 'warning' | 'success' | 'neutral' | 'primary';

type StatusBadgeProps = {
  label: string;
  tone: BadgeTone;
  bordered?: boolean;
};

const toneColors: Record<BadgeTone, { text: string; background: string }> = {
  error: { text: colors.error, background: colors.errorBackground },
  warning: { text: colors.warning, background: colors.warningBackground },
  success: { text: colors.success, background: colors.successBackground },
  neutral: { text: colors.textSecondary, background: colors.muted },
  primary: { text: colors.primary, background: colors.primaryBackground },
};

export function StatusBadge({ label, tone, bordered = true }: StatusBadgeProps) {
  const palette = toneColors[tone];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.background },
        bordered && { borderWidth: 1, borderColor: withAlpha(palette.text, 0.2) },
      ]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  label: {
    ...typography.labelSm,
    fontFamily: typography.labelMd.fontFamily,
  },
});
