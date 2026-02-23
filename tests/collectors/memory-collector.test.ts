import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCollector } from '../../src/collectors/memory-collector';
import { EventBus } from '../../src/core/event-bus';

function setMemory(used: number, total: number, limit: number) {
  Object.defineProperty(performance, 'memory', {
    value: {
      usedJSHeapSize: used,
      totalJSHeapSize: total,
      jsHeapSizeLimit: limit,
    },
    writable: true,
    configurable: true,
  });
}

function clearMemory() {
  Object.defineProperty(performance, 'memory', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

describe('MemoryCollector', () => {
  let eventBus: EventBus;
  let collector: MemoryCollector;

  beforeEach(() => {
    vi.useFakeTimers();
    eventBus = new EventBus();
  });

  afterEach(() => {
    collector?.teardown();
    vi.useRealTimers();
    clearMemory();
  });

  it('does not set up interval when performance.memory is unavailable', () => {
    clearMemory();
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    vi.advanceTimersByTime(10_000);

    expect(crumbs.length).toBe(0);
  });

  it('emits breadcrumb:added on each sample interval', () => {
    setMemory(50_000_000, 100_000_000, 200_000_000);
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    vi.advanceTimersByTime(10_000);

    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toMatchObject({
      category: 'memory',
      message: expect.stringContaining('Heap:'),
    });
  });

  it('emits memory:captured when heap usage exceeds 90% of limit', () => {
    // Initial baseline
    setMemory(50_000_000, 100_000_000, 200_000_000);
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const events: unknown[] = [];
    eventBus.on('memory:captured', (data) => events.push(data));

    // Simulate high usage on next sample
    setMemory(185_000_000, 190_000_000, 200_000_000);
    vi.advanceTimersByTime(10_000);

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      kind: 'memory',
      message: expect.stringContaining('critical'),
    });
  });

  it('emits memory:captured when heap growth exceeds 50% of baseline', () => {
    setMemory(100_000_000, 150_000_000, 500_000_000);
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const events: unknown[] = [];
    eventBus.on('memory:captured', (data) => events.push(data));

    // 60% growth from baseline of 100MB
    setMemory(160_000_000, 200_000_000, 500_000_000);
    vi.advanceTimersByTime(10_000);

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      kind: 'memory',
      message: expect.stringContaining('growth'),
    });
  });

  it('does NOT emit memory:captured when heap is healthy', () => {
    setMemory(50_000_000, 100_000_000, 200_000_000);
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const events: unknown[] = [];
    eventBus.on('memory:captured', (data) => events.push(data));

    // Stays healthy
    vi.advanceTimersByTime(10_000);

    expect(events.length).toBe(0);
  });

  it('clears interval on teardown', () => {
    setMemory(50_000_000, 100_000_000, 200_000_000);
    collector = new MemoryCollector(eventBus);
    collector.setup();

    const crumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => crumbs.push(data));

    collector.teardown();
    vi.advanceTimersByTime(20_000);

    expect(crumbs.length).toBe(0);
  });
});
