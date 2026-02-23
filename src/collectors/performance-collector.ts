import type { Collector, PerformancePayload } from '../types';
import type { EventBus } from '../core/event-bus';

const LONGTASK_THRESHOLD = 50;

export class PerformanceCollector implements Collector {
  readonly name = 'performance';
  private observers: PerformanceObserver[] = [];

  constructor(private eventBus: EventBus) {}

  setup(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    this.observe('longtask', (entries) => {
      entries.forEach((entry) => {
        if (entry.duration < LONGTASK_THRESHOLD) return;
        const payload: PerformancePayload = {
          kind: 'performance',
          metric: 'longtask',
          value: Math.round(entry.duration),
          entries: [{ name: entry.name, duration: entry.duration, startTime: entry.startTime }],
        };
        this.eventBus.emit('performance:captured', payload);
        this.eventBus.emit('breadcrumb:added', {
          category: 'performance',
          message: `Long task: ${Math.round(entry.duration)}ms`,
        });
      });
    });

    this.observe('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1];
      if (!last) return;
      this.eventBus.emit('breadcrumb:added', {
        category: 'performance',
        message: `LCP: ${Math.round(last.startTime)}ms`,
        data: { value: last.startTime },
      });
    });

    this.observe('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.eventBus.emit('breadcrumb:added', {
            category: 'performance',
            message: `FCP: ${Math.round(entry.startTime)}ms`,
            data: { value: entry.startTime },
          });
        }
      });
    });

    this.observe('layout-shift', (entries) => {
      entries.forEach((entry) => {
        const value = (entry as unknown as { value: number }).value;
        if (value > 0.1) {
          this.eventBus.emit('breadcrumb:added', {
            category: 'performance',
            message: `Layout shift: ${value.toFixed(4)}`,
            data: { cls: value },
          });
        }
      });
    });
  }

  private observe(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
      this.observers.push(observer);
    } catch {
      // Entry type not supported in this browser — silently skip
    }
  }

  teardown(): void {
    this.observers.forEach((o) => o.disconnect());
    this.observers = [];
  }
}
