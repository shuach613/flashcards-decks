export function normalizeEmail(value: string) {
  return value.toLowerCase().trim();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
