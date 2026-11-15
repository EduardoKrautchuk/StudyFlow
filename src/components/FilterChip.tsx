import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  dotColor?: string;
};

export function FilterChip({ label, selected, onPress, dotColor }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBackground,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  label: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelSelected: {
    fontFamily: typography.labelMd.fontFamily,
    color: colors.primary,
  },
});
