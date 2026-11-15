import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Calendar } from '@/components/Calendar';
import { PickerModal } from '@/components/PickerModal';
import { PickerTrigger } from '@/components/PickerTrigger';
import { spacing } from '@/constants/theme';
import { formatDateLabel, toDateKey } from '@/utils/date';

type DatePickerFieldProps = {
  value: string | null;
  onChange: (dateKey: string) => void;
  error?: boolean;
  disabled?: boolean;
};

export function DatePickerField({ value, onChange, error = false, disabled = false }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  function select(dateKey: string) {
    onChange(dateKey);
    setOpen(false);
  }

  return (
    <>
      <PickerTrigger
        icon={CalendarDays}
        label={value ? formatDateLabel(value) : 'Selecione a data'}
        placeholder={!value}
        active={open}
        error={error}
        disabled={disabled}
        accessibilityLabel="Selecionar data de entrega"
        onPress={() => setOpen(true)}
      />
      <PickerModal visible={open} title="Data de entrega" onClose={() => setOpen(false)}>
        <Calendar value={value} onChange={select} />
        <View style={styles.footer}>
          <View style={styles.action}>
            <AppButton title="Cancelar" variant="outline" size="sm" onPress={() => setOpen(false)} />
          </View>
          <View style={styles.action}>
            <AppButton title="Hoje" size="sm" onPress={() => select(toDateKey(new Date()))} />
          </View>
        </View>
      </PickerModal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
