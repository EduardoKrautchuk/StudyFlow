import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

export function FieldLabel({ label, required = false }: FieldLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {required ? <Text style={styles.required}>Obrigatório</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.labelMd,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  required: {
    ...typography.labelSm,
    color: colors.primary,
  },
});
