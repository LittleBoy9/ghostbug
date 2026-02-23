// jsdom doesn't implement performance.memory, stub it
Object.defineProperty(performance, 'memory', {
  value: { usedJSHeapSize: 0, totalJSHeapSize: 0 },
  writable: true,
  configurable: true,
});
