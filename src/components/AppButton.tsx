import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type AppButtonVariant = 'primary' | 'outline';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  variant?: AppButtonVariant;
  iconPosition?: 'start' | 'end';
};

export function AppButton({
  title,
  onPress,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  iconPosition = 'end',
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const contentColor = isPrimary ? colors.onPrimary : colors.text;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        pressed && (isPrimary ? styles.primaryPressed : styles.outlinePressed),
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'start' ? <Icon size={20} color={contentColor} strokeWidth={2} /> : null}
          <Text style={[styles.title, { color: contentColor }]}>{title}</Text>
          {Icon && iconPosition === 'end' ? <Icon size={20} color={contentColor} strokeWidth={2} /> : null}
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
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
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
});
