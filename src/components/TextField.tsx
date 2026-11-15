import { CircleAlert } from 'lucide-react-native';
import { useState, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { FieldLabel } from '@/components/FieldLabel';
import { colors, radius, spacing, typography } from '@/constants/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  required?: boolean;
  error?: string;
  ref?: Ref<TextInputInstance>;
};

export function TextField({ label, required = false, error, multiline, onFocus, onBlur, ref, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      <TextInput
        ref={ref}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
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
      {error ? (
        <View style={styles.errorRow}>
          <CircleAlert size={14} color={colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...typography.bodyLg,
    fontSize: 15,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  multiline: {
    minHeight: 96,
    fontFamily: typography.bodyMd.fontFamily,
    lineHeight: 22,
  },
  inputFocused: {
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryBackground,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    ...typography.labelSm,
    color: colors.error,
    flexShrink: 1,
  },
});
