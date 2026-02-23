import type { Collector, MemoryPayload } from '../types';
import type { EventBus } from '../core/event-bus';

const SAMPLE_INTERVAL_MS = 10_000;
const HEAP_USAGE_THRESHOLD = 0.9;
const HEAP_GROWTH_THRESHOLD = 0.5;

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

function getMemory(): MemoryInfo | null {
  const mem = (performance as unknown as { memory?: MemoryInfo }).memory;
  if (!mem || typeof mem.usedJSHeapSize !== 'number') return null;
  return mem;
}

export class MemoryCollector implements Collector {
  readonly name = 'memory';
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private baselineUsed: number | null = null;

  constructor(private eventBus: EventBus) {}

  setup(): void {
    const initial = getMemory();
    if (!initial) return;

    this.baselineUsed = initial.usedJSHeapSize;

    this.intervalId = setInterval(() => {
      const mem = getMemory();
      if (!mem) return;

      const heapUsagePercent = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
      const heapGrowthPercent =
        this.baselineUsed! > 0
          ? (mem.usedJSHeapSize - this.baselineUsed!) / this.baselineUsed!
          : 0;

      this.eventBus.emit('breadcrumb:added', {
        category: 'memory',
        message: `Heap: ${(heapUsagePercent * 100).toFixed(1)}% used (${(mem.usedJSHeapSize / 1_048_576).toFixed(1)}MB)`,
        data: {
          usedJSHeapSize: mem.usedJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
        },
      });

      const isHighUsage = heapUsagePercent >= HEAP_USAGE_THRESHOLD;
      const isHighGrowth = heapGrowthPercent >= HEAP_GROWTH_THRESHOLD;

      if (isHighUsage || isHighGrowth) {
        const message = isHighUsage
          ? `Heap usage critical: ${(heapUsagePercent * 100).toFixed(1)}% of limit`
          : `Heap growth spike: ${(heapGrowthPercent * 100).toFixed(1)}% since init`;

        const payload: MemoryPayload = {
          kind: 'memory',
          message,
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
          heapUsagePercent,
          heapGrowthPercent,
        };
        this.eventBus.emit('memory:captured', payload);
      }
    }, SAMPLE_INTERVAL_MS);
  }

  teardown(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.baselineUsed = null;
  }
}
