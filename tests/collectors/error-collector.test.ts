import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus';
import { ErrorCollector } from '../../src/collectors/error-collector';

describe('ErrorCollector', () => {
  let eventBus: EventBus;
  let collector: ErrorCollector;

  beforeEach(() => {
    eventBus = new EventBus();
    collector = new ErrorCollector(eventBus);
    collector.setup();
  });

  afterEach(() => {
    collector.teardown();
  });

  it('captures errors via window.onerror', () => {
    const captured: unknown[] = [];
    eventBus.on('error:captured', (payload) => captured.push(payload));

    const error = new Error('Test error');
    window.onerror?.('Test error', 'test.js', 1, 5, error);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      kind: 'error',
      message: 'Test error',
      filename: 'test.js',
      lineno: 1,
      colno: 5,
    });
  });

  it('captures unhandled promise rejections', () => {
    const captured: unknown[] = [];
    eventBus.on('error:captured', (payload) => captured.push(payload));

    const error = new Error('Rejected!');
    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        reason: error,
        promise: Promise.resolve(),
      })
    );

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      kind: 'error',
      message: 'Rejected!',
      name: 'Error',
    });
  });

  it('captures string rejection reasons', () => {
    const captured: unknown[] = [];
    eventBus.on('error:captured', (payload) => captured.push(payload));

    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        reason: 'string reason',
        promise: Promise.resolve(),
      })
    );

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      message: 'string reason',
      name: 'UnhandledRejection',
    });
  });

  it('preserves and calls original window.onerror', () => {
    collector.teardown();

    const original = vi.fn();
    window.onerror = original;

    const collector2 = new ErrorCollector(eventBus);
    collector2.setup();

    window.onerror?.('msg', 'file.js', 1, 1, new Error('msg'));

    expect(original).toHaveBeenCalled();
    collector2.teardown();
  });

  it('restores original window.onerror on teardown', () => {
    collector.teardown();

    const original = vi.fn();
    window.onerror = original;

    const collector2 = new ErrorCollector(eventBus);
    collector2.setup();
    collector2.teardown();

    expect(window.onerror).toBe(original);
  });
});
