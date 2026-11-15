import { ChevronDown, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type PickerTriggerProps = {
  icon: LucideIcon;
  label: string;
  placeholder: boolean;
  active: boolean;
  error?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
};

export function PickerTrigger({
  icon: Icon,
  label,
  placeholder,
  active,
  error = false,
  disabled = false,
  accessibilityLabel,
  onPress,
}: PickerTriggerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={[styles.trigger, active && styles.active, error && styles.error]}>
      <Icon size={18} color={colors.primary} strokeWidth={1.75} />
      <Text style={[styles.label, placeholder && styles.placeholder]} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDown size={18} color={colors.textSecondary} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: {
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryBackground,
  },
  error: {
    borderColor: colors.error,
  },
  label: {
    flex: 1,
    ...typography.bodyMd,
    fontSize: 15,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
  },
  placeholder: {
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.textSecondary,
  },
});
