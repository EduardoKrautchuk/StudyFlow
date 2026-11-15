import { CircleAlert, type LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { colors, radius, spacing, typography } from '@/constants/theme';

export type DialogTone = 'default' | 'danger';

export type DialogOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string | null;
  tone?: DialogTone;
  icon?: LucideIcon;
};

type ConfirmDialogProps = {
  options: DialogOptions | null;
  onResult: (confirmed: boolean) => void;
};

export function ConfirmDialog({ options, onResult }: ConfirmDialogProps) {
  const tone = options?.tone ?? 'default';
  const Icon = options?.icon ?? CircleAlert;
  const isDanger = tone === 'danger';
  const cancelLabel = options?.cancelLabel === undefined ? 'Cancelar' : options.cancelLabel;

  return (
    <Modal visible={options !== null} transparent animationType="fade" onRequestClose={() => onResult(false)}>
      <Pressable style={styles.backdrop} onPress={() => onResult(false)} accessibilityLabel="Fechar aviso">
        <Pressable style={styles.dialog} onPress={() => undefined} accessibilityRole="alert">
          <View style={[styles.icon, { backgroundColor: isDanger ? colors.errorBackground : colors.primaryBackground }]}>
            <Icon size={24} color={isDanger ? colors.error : colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{options?.title}</Text>
          <Text style={styles.message}>{options?.message}</Text>
          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={styles.action}>
                <AppButton title={cancelLabel} variant="outline" size="sm" onPress={() => onResult(false)} />
              </View>
            ) : null}
            <View style={styles.action}>
              <AppButton
                title={options?.confirmLabel ?? ''}
                variant={isDanger ? 'danger' : 'primary'}
                size="sm"
                onPress={() => onResult(true)}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: 'rgba(41, 37, 36, 0.4)',
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radius.lg + 4,
    backgroundColor: colors.surface,
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 19,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  action: {
    flex: 1,
  },
});
