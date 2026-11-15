import { FirebaseError } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';

const firestoreErrorMessages: Record<string, string> = {
  'permission-denied': 'Sem permissão para acessar os dados. Verifique as regras do Firestore.',
  unavailable: 'Sem conexão com o servidor. Verifique sua internet.',
  'not-found': 'O registro não foi encontrado.',
  'failed-precondition': 'O banco de dados não está configurado. Verifique o Firestore no Firebase Console.',
};

export function getDataErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return firestoreErrorMessages[error.code] ?? 'Não foi possível concluir a operação. Tente novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.some((option) => option === value);
}
