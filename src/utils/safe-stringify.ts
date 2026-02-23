export function safeStringify(value: unknown, indent?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      if (typeof val === 'function') return '[Function]';
      if (typeof val === 'symbol') return val.toString();
      if (val instanceof Error) {
        return { name: val.name, message: val.message, stack: val.stack };
      }
      return val;
    },
    indent
  );
}
