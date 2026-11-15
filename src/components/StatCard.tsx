import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '@/constants/theme';

type StatCardProps = {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  highlight?: boolean;
};

export function StatCard({ label, value, caption, icon: Icon, highlight = false }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.icon}>
          <Icon size={16} color={colors.primary} strokeWidth={2} />
        </View>
      </View>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
      <Text style={styles.caption} numberOfLines={2}>
        {caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.headlineLg,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
  },
  valueHighlight: {
    color: colors.primary,
  },
  caption: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
