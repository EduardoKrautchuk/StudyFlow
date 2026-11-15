import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  WEEKDAY_INITIALS,
  addMonths,
  formatMonthTitle,
  getCalendarDays,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from '@/utils/date';

type CalendarProps = {
  value: string | null;
  onChange: (dateKey: string) => void;
};

export function Calendar({ value, onChange }: CalendarProps) {
  const todayKey = toDateKey(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(value ? parseDateKey(value) : new Date()));
  const days = getCalendarDays(visibleMonth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          hitSlop={6}
          onPress={() => setVisibleMonth((month) => addMonths(month, -1))}
          style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}>
          <ChevronLeft size={18} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.monthTitle} accessibilityRole="header">
          {formatMonthTitle(visibleMonth)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          hitSlop={6}
          onPress={() => setVisibleMonth((month) => addMonths(month, 1))}
          style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {WEEKDAY_INITIALS.map((initial, index) => (
          <Text key={`${initial}-${index}`} style={styles.weekday}>
            {initial}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const key = toDateKey(day);
          const outside = day.getMonth() !== visibleMonth.getMonth();
          const selected = key === value;
          const today = key === todayKey;
          return (
            <View key={key} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={key}
                onPress={() => onChange(key)}
                style={({ pressed }) => [
                  styles.day,
                  today && !selected && styles.today,
                  pressed && !selected && styles.dayPressed,
                  selected && styles.selected,
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    outside && styles.outsideText,
                    today && !selected && styles.todayText,
                    selected && styles.selectedText,
                  ]}>
                  {day.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPressed: {
    backgroundColor: colors.muted,
  },
  monthTitle: {
    ...typography.labelMd,
    fontSize: 15,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.labelSm,
    fontSize: 12,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  dayPressed: {
    backgroundColor: colors.muted,
  },
  today: {
    backgroundColor: colors.primaryBackground,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.bodyMd,
    color: colors.text,
  },
  outsideText: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  todayText: {
    fontFamily: typography.labelMd.fontFamily,
    color: colors.primary,
  },
  selectedText: {
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onPrimary,
  },
});
