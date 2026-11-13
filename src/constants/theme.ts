export const colors = {
  primary: '#B45336',
  primaryPressed: '#92432B',
  primarySoft: '#E9A58D',
  primaryBackground: '#FBECE5',
  background: '#FAF7F2',
  surface: '#FFFFFF',
  text: '#292524',
  textSecondary: '#78716C',
  border: '#E7DDD4',
  muted: '#F3EEE8',
  success: '#15803D',
  successBackground: '#DCFCE7',
  warning: '#D97706',
  warningBackground: '#FEF3C7',
  error: '#DC2626',
  errorBackground: '#FEE2E2',
  onPrimary: '#FFFFFF',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  full: 9999,
} as const;

export const typography = {
  headlineLg: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineMd: { fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 28 },
  headlineSm: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
  bodyLg: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  labelMd: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  labelSm: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.22 },
} as const;

export const shadow = {
  shadowColor: '#292524',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 2,
} as const;
