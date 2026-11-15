import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatWeekdayShort, toDateKey } from '@/utils/date';

type WeekStripProps = {
  days: Date[];
  selectedKey: string;
  todayKey: string;
  indicators: Map<string, string>;
  onSelect: (dateKey: string) => void;
};

export function WeekStrip({ days, selectedKey, todayKey, indicators, onSelect }: WeekStripProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {days.map((day) => {
        const key = toDateKey(day);
        const selected = key === selectedKey;
        const today = key === todayKey;
        const indicator = indicators.get(key);
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={key}
            onPress={() => onSelect(key)}
            style={({ pressed }) => [
              styles.day,
              today && !selected && styles.today,
              pressed && !selected && styles.pressed,
              selected && styles.selected,
            ]}>
            <Text style={[styles.weekday, selected && styles.selectedText]}>{formatWeekdayShort(day).toUpperCase()}</Text>
            <Text style={[styles.number, today && !selected && styles.todayNumber, selected && styles.selectedNumber]}>
              {day.getDate()}
            </Text>
            <View
              style={[
                styles.dot,
                { backgroundColor: indicator ? (selected ? colors.onPrimary : indicator) : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
  today: {
    borderColor: colors.primary,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  weekday: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.textSecondary,
  },
  number: {
    ...typography.headlineSm,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },
  todayNumber: {
    color: colors.primary,
  },
  selectedText: {
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onPrimary,
  },
  selectedNumber: {
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onPrimary,
  },
  dot: {
    width: 6,
    height: 6,
    marginTop: 2,
    borderRadius: radius.full,
  },
});
