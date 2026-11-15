import type { LucideIcon } from 'lucide-react-native';
import { Modal, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/constants/theme';

const MODAL_DISMISS_DELAY = 350;

export type ActionSheetOption = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onPress: () => void;
};

type ActionSheetProps = {
  visible: boolean;
  title: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, options, onClose }: ActionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar menu">
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => undefined}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {options.map(({ label, icon: Icon, destructive = false, onPress }) => {
            const color = destructive ? colors.error : colors.text;
            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  setTimeout(onPress, Platform.OS === 'ios' ? MODAL_DISMISS_DELAY : 0);
                }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                <Icon size={20} color={color} strokeWidth={1.75} />
                <Text style={[styles.optionText, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && styles.optionPressed]}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(41, 37, 36, 0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  title: {
    ...typography.labelMd,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionPressed: {
    backgroundColor: colors.muted,
  },
  optionText: {
    ...typography.bodyLg,
    fontFamily: typography.labelSm.fontFamily,
  },
  cancel: {
    height: 52,
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.bodyLg,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.textSecondary,
  },
});
