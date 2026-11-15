import { BookOpen } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing, typography } from '@/constants/theme';

type AppHeaderProps = {
  initials: string;
  onAvatarPress: () => void;
};

export function AppHeader({ initials, onAvatarPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <BookOpen size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.brandName}>StudyFlow</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Conta e sair"
          hitSlop={6}
          onPress={onAvatarPress}
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...typography.headlineSm,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryBackground,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    backgroundColor: colors.muted,
  },
  avatarText: {
    ...typography.labelMd,
    color: colors.primary,
  },
});
