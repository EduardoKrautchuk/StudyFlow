import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';

type FormHeaderProps = {
  title: string;
  onBack: () => void;
};

export function FormHeader({ title, onBack }: FormHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={onBack}
          style={styles.back}>
          {({ pressed }) => (
            <>
              <ChevronLeft size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.backText, pressed && styles.pressed]}>Voltar</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  bar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  back: {
    width: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    ...typography.bodyLg,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    flex: 1,
    ...typography.headlineSm,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  side: {
    width: 88,
  },
});
