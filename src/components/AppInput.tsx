import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type AppInputProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  icon: LucideIcon;
  labelAccessory?: ReactNode;
  error?: string;
  password?: boolean;
  footer?: ReactNode;
  ref?: Ref<TextInputInstance>;
};

export function AppInput({
  label,
  icon: Icon,
  labelAccessory,
  error,
  password = false,
  footer,
  onFocus,
  onBlur,
  ref,
  ...inputProps
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const VisibilityIcon = hidden ? Eye : EyeOff;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelAccessory}
      </View>
      <View style={[styles.field, focused && styles.fieldFocused, error ? styles.fieldError : null]}>
        <Icon size={20} color={focused ? colors.primary : colors.textSecondary} strokeWidth={1.75} />
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          secureTextEntry={password && hidden}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.visibilityButton}>
            <VisibilityIcon size={20} color={colors.textSecondary} strokeWidth={1.75} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <CircleAlert size={14} color={colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },
  label: {
    ...typography.labelMd,
    color: colors.text,
  },
  field: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingLeft: spacing.md + 2,
    paddingRight: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.muted,
    backgroundColor: colors.muted,
  },
  fieldFocused: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primaryBackground,
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  visibilityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  errorText: {
    ...typography.labelSm,
    color: colors.error,
    flexShrink: 1,
  },
});
