import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus';
import { ConsoleCollector } from '../../src/collectors/console-collector';

describe('ConsoleCollector', () => {
  let eventBus: EventBus;
  let collector: ConsoleCollector;
  let originalError: typeof console.error;
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    originalError = console.error;
    originalWarn = console.warn;
    eventBus = new EventBus();
    collector = new ConsoleCollector(eventBus);
    collector.setup();
  });

  afterEach(() => {
    collector.teardown();
    // Double check restoration
    console.error = originalError;
    console.warn = originalWarn;
  });

  it('captures console.error calls', () => {
    const captured: unknown[] = [];
    eventBus.on('console:captured', (payload) => captured.push(payload));

    console.error('something went wrong');

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      kind: 'console',
      level: 'error',
    });
  });

  it('captures console.warn calls', () => {
    const captured: unknown[] = [];
    eventBus.on('console:captured', (payload) => captured.push(payload));

    console.warn('be careful');

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      kind: 'console',
      level: 'warn',
    });
  });

  it('still calls original console.error', () => {
    const spy = vi.fn();
    collector.teardown();

    console.error = spy;
    const collector2 = new ConsoleCollector(eventBus);
    collector2.setup();

    console.error('test');

    expect(spy).toHaveBeenCalledWith('test');
    collector2.teardown();
  });

  it('restores original console methods on teardown', () => {
    collector.teardown();

    expect(console.error).toBe(originalError);
    expect(console.warn).toBe(originalWarn);
  });
});
