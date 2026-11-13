import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '@/services/firebase';

const authErrorMessages: Record<string, string> = {
  'auth/invalid-email': 'O e-mail informado é inválido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
  'auth/missing-email': 'Informe seu e-mail.',
  'auth/invalid-api-key': 'Configuração do Firebase inválida. Verifique o arquivo .env.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Configuração do Firebase inválida. Verifique o arquivo .env.',
  'auth/operation-not-allowed': 'Login por e-mail e senha não está habilitado no Firebase.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? 'Não foi possível concluir a operação. Tente novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
