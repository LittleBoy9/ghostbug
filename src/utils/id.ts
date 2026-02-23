export function generateId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}
