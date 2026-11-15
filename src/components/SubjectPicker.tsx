import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Subject } from '@/types/models';

type SubjectPickerProps = {
  subjects: Subject[];
  value: string | null;
  onChange: (subjectId: string) => void;
  error?: boolean;
  disabled?: boolean;
};

export function SubjectPicker({ subjects, value, onChange, error = false, disabled = false }: SubjectPickerProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = subjects.find((subject) => subject.id === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Selecionar matéria"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, open && styles.triggerOpen, error && styles.triggerError]}>
        <View style={styles.triggerContent}>
          <View style={[styles.dot, { backgroundColor: selected?.color ?? colors.border }]} />
          <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
            {selected?.name ?? 'Selecione uma matéria'}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.textSecondary} strokeWidth={1.75} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar seleção">
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Selecione a matéria</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {subjects.map((subject) => {
                const isSelected = subject.id === value;
                return (
                  <Pressable
                    key={subject.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(subject.id);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.item, (pressed || isSelected) && styles.itemActive]}>
                    <View style={[styles.dot, { backgroundColor: subject.color }]} />
                    <Text style={styles.itemText} numberOfLines={1}>
                      {subject.name}
                    </Text>
                    {isSelected ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  triggerOpen: {
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryBackground,
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  triggerText: {
    flex: 1,
    ...typography.bodyLg,
    fontSize: 15,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
    fontFamily: typography.bodyMd.fontFamily,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(41, 37, 36, 0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '70%',
    alignSelf: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    backgroundColor: colors.surface,
  },
  sheetTitle: {
    ...typography.labelMd,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  item: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemActive: {
    backgroundColor: colors.muted,
  },
  itemText: {
    flex: 1,
    ...typography.bodyLg,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.text,
  },
});
