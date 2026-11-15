import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type ColorPickerProps = {
  options: readonly string[];
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ options, value, onChange }: ColorPickerProps) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {options.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Cor ${color}`}
            onPress={() => onChange(color)}
            style={[styles.option, selected && { borderColor: color }]}>
            <View style={[styles.swatch, { backgroundColor: color }]}>
              {selected ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  option: {
    width: 44,
    height: 44,
    padding: 3,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatch: {
    flex: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
