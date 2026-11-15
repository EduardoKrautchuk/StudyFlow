import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type Option<T extends string> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

type OptionGroupProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  appearance?: 'filled' | 'soft';
};

export function OptionGroup<T extends string>({ options, value, onChange, appearance = 'filled' }: OptionGroupProps<T>) {
  const stacked = appearance === 'soft';

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const selected = optionValue === value;
        const contentColor = selected ? (stacked ? colors.primary : colors.onPrimary) : colors.textSecondary;
        return (
          <Pressable
            key={optionValue}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(optionValue)}
            style={[
              styles.option,
              stacked ? styles.stacked : styles.inline,
              selected && (stacked ? styles.softSelected : styles.filledSelected),
            ]}>
            <Icon size={stacked ? 20 : 17} color={contentColor} strokeWidth={1.75} />
            <Text style={[styles.label, { color: contentColor }, selected && styles.labelSelected]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.xs,
  },
  inline: {
    height: 44,
    flexDirection: 'row',
    gap: 6,
  },
  stacked: {
    height: 64,
    gap: spacing.xs,
  },
  filledSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  softSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  label: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: 14,
  },
  labelSelected: {
    fontFamily: typography.labelMd.fontFamily,
  },
});
