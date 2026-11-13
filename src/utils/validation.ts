const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;

export function isValidEmail(email: string): boolean {
  return emailPattern.test(email.trim());
}

export function hasMinPasswordLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Informe seu e-mail.';
  }
  if (!isValidEmail(email)) {
    return 'Informe um e-mail válido.';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Informe sua senha.';
  }
  if (!hasMinPasswordLength(password)) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return undefined;
}
