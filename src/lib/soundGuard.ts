export function playSoundSafe(fn: () => void): void {
  if (typeof window !== 'undefined') fn();
}
