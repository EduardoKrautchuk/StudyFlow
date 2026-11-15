import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type AppButtonVariant = 'primary' | 'outline' | 'danger';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  variant?: AppButtonVariant;
  iconPosition?: 'start' | 'end';
  size?: 'md' | 'sm';
};

export function AppButton({
  title,
  onPress,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  iconPosition = 'end',
  size = 'md',
}: AppButtonProps) {
  const iconSize = size === 'sm' ? 18 : 20;
  const isFilled = variant !== 'outline';
  const contentColor = isFilled ? colors.onPrimary : colors.text;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.small,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'start' ? <Icon size={iconSize} color={contentColor} strokeWidth={2} /> : null}
          <Text style={[styles.title, size === 'sm' && styles.smallTitle, { color: contentColor }]}>{title}</Text>
          {Icon && iconPosition === 'end' ? <Icon size={iconSize} color={contentColor} strokeWidth={2} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  small: {
    height: 42,
    paddingHorizontal: spacing.md + 2,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  danger: {
    backgroundColor: colors.error,
  },
  dangerPressed: {
    backgroundColor: colors.errorPressed,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlinePressed: {
    backgroundColor: colors.muted,
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
  },
  smallTitle: {
    fontSize: 14,
  },
});
