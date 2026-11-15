import { Clock } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { PickerModal } from '@/components/PickerModal';
import { PickerTrigger } from '@/components/PickerTrigger';
import { colors, radius, spacing, typography } from '@/constants/theme';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const DEFAULT_TIME = '23:59';
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

type TimeColumnProps = {
  label: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
};

function TimeColumn({ label, items, value, onChange }: TimeColumnProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const selectedIndex = Math.max(items.indexOf(value), 0);

  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <ScrollView
        ref={scrollRef}
        style={styles.columnList}
        showsVerticalScrollIndicator={false}
        onLayout={() =>
          scrollRef.current?.scrollTo({ y: Math.max((selectedIndex - 2) * ITEM_HEIGHT, 0), animated: false })
        }>
        {items.map((item) => {
          const selected = item === value;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label} ${item}`}
              onPress={() => onChange(item)}
              style={({ pressed }) => [styles.item, pressed && !selected && styles.itemPressed, selected && styles.itemSelected]}>
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type TimePickerFieldProps = {
  value: string | null;
  onChange: (time: string | null) => void;
  disabled?: boolean;
};

export function TimePickerField({ value, onChange, disabled = false }: TimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? DEFAULT_TIME);
  const [hour, minute] = draft.split(':');

  function openPicker() {
    setDraft(value ?? DEFAULT_TIME);
    setOpen(true);
  }

  function finish(time: string | null) {
    onChange(time);
    setOpen(false);
  }

  return (
    <>
      <PickerTrigger
        icon={Clock}
        label={value ?? 'Sem horário'}
        placeholder={!value}
        active={open}
        disabled={disabled}
        accessibilityLabel="Selecionar horário de entrega"
        onPress={openPicker}
      />
      <PickerModal visible={open} title="Horário de entrega" onClose={() => setOpen(false)}>
        <Text style={styles.preview}>{draft}</Text>
        <View style={styles.columns}>
          <TimeColumn label="Hora" items={HOURS} value={hour} onChange={(next) => setDraft(`${next}:${minute}`)} />
          <TimeColumn label="Minuto" items={MINUTES} value={minute} onChange={(next) => setDraft(`${hour}:${next}`)} />
        </View>
        <View style={styles.footer}>
          <View style={styles.action}>
            <AppButton title="Sem horário" variant="outline" size="sm" onPress={() => finish(null)} />
          </View>
          <View style={styles.action}>
            <AppButton title="Confirmar" size="sm" onPress={() => finish(draft)} />
          </View>
        </View>
      </PickerModal>
    </>
  );
}

const styles = StyleSheet.create({
  preview: {
    ...typography.headlineLg,
    fontSize: 32,
    lineHeight: 40,
    color: colors.text,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
  columnLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  columnList: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  itemPressed: {
    backgroundColor: colors.muted,
  },
  itemSelected: {
    backgroundColor: colors.primary,
  },
  itemText: {
    ...typography.bodyLg,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  itemTextSelected: {
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
