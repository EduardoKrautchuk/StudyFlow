import { CircleAlert, CircleCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type FormAlertProps = {
  title: string;
  message?: string;
  variant?: 'error' | 'success';
};

export function FormAlert({ title, message, variant = 'error' }: FormAlertProps) {
  const isError = variant === 'error';
  const color = isError ? colors.error : colors.success;
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: isError ? colors.errorBackground : colors.successBackground }]}>
      <Icon size={18} color={color} strokeWidth={2} style={styles.icon} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  icon: {
    marginTop: 1,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelMd,
  },
  message: {
    ...typography.bodySm,
    color: colors.text,
  },
});
