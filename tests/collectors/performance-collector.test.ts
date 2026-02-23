import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceCollector } from '../../src/collectors/performance-collector';
import { EventBus } from '../../src/core/event-bus';

// Mock PerformanceObserver
type ObserverCallback = (list: { getEntries: () => Partial<PerformanceEntry>[] }) => void;

let registeredObservers: { type: string; callback: ObserverCallback }[] = [];

class MockPerformanceObserver {
  private callback: ObserverCallback;
  constructor(cb: ObserverCallback) {
    this.callback = cb;
  }
  observe(options: { type: string }) {
    registeredObservers.push({ type: options.type, callback: this.callback });
  }
  disconnect() {}
}

function triggerObserver(type: string, entries: Partial<PerformanceEntry>[]) {
  const obs = registeredObservers.find((o) => o.type === type);
  if (obs) {
    obs.callback({ getEntries: () => entries });
  }
}

describe('PerformanceCollector', () => {
  let eventBus: EventBus;
  let collector: PerformanceCollector;
  const originalPerformanceObserver = globalThis.PerformanceObserver;

  beforeEach(() => {
    registeredObservers = [];
    globalThis.PerformanceObserver = MockPerformanceObserver as unknown as typeof PerformanceObserver;
    eventBus = new EventBus();
    collector = new PerformanceCollector(eventBus);
    collector.setup();
  });

  afterEach(() => {
    collector.teardown();
    globalThis.PerformanceObserver = originalPerformanceObserver;
  });

  it('emits performance:captured for longtask entries >= 50ms', () => {
    const events: unknown[] = [];
    eventBus.on('performance:captured', (data) => events.push(data));

    triggerObserver('longtask', [{ name: 'self', duration: 120, startTime: 500 }]);

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      kind: 'performance',
      metric: 'longtask',
      value: 120,
    });
  });

  it('does NOT emit performance:captured for longtask entries < 50ms', () => {
    const events: unknown[] = [];
    eventBus.on('performance:captured', (data) => events.push(data));

    triggerObserver('longtask', [{ name: 'self', duration: 30, startTime: 100 }]);

    expect(events.length).toBe(0);
  });

  it('emits breadcrumb:added for longtask', () => {
    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    triggerObserver('longtask', [{ name: 'self', duration: 80, startTime: 200 }]);

    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toMatchObject({
      category: 'performance',
      message: 'Long task: 80ms',
    });
  });

  it('emits breadcrumb:added for LCP', () => {
    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    triggerObserver('largest-contentful-paint', [{ name: 'url', startTime: 1234, duration: 0 }]);

    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toMatchObject({
      category: 'performance',
      message: 'LCP: 1234ms',
    });
  });

  it('emits breadcrumb:added for FCP', () => {
    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    triggerObserver('paint', [{ name: 'first-contentful-paint', startTime: 456, duration: 0 }]);

    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toMatchObject({
      category: 'performance',
      message: 'FCP: 456ms',
    });
  });

  it('emits breadcrumb:added for layout-shift when value > 0.1', () => {
    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    triggerObserver('layout-shift', [{ name: '', duration: 0, startTime: 0, value: 0.25 } as unknown as PerformanceEntry]);

    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toMatchObject({
      category: 'performance',
      message: 'Layout shift: 0.2500',
    });
  });

  it('does not emit breadcrumb for layout-shift when value <= 0.1', () => {
    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    triggerObserver('layout-shift', [{ name: '', duration: 0, startTime: 0, value: 0.05 } as unknown as PerformanceEntry]);

    expect(crumbs.length).toBe(0);
  });

  it('does not throw when PerformanceObserver is undefined', () => {
    collector.teardown();
    globalThis.PerformanceObserver = undefined as unknown as typeof PerformanceObserver;

    const noopCollector = new PerformanceCollector(eventBus);
    expect(() => noopCollector.setup()).not.toThrow();
    noopCollector.teardown();
  });

  it('disconnects all observers on teardown', () => {
    const disconnectSpy = vi.fn();
    // Replace observers with spied ones
    (collector as any).observers.forEach((o: any) => {
      o.disconnect = disconnectSpy;
    });

    collector.teardown();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
