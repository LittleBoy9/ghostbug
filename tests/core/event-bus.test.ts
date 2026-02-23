import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/event-bus';

describe('EventBus', () => {
  it('calls handlers when event is emitted', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.on('error:captured', handler);
    bus.emit('error:captured', { message: 'test' });

    expect(handler).toHaveBeenCalledWith({ message: 'test' });
  });

  it('supports multiple handlers per event', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on('error:captured', h1);
    bus.on('error:captured', h2);
    bus.emit('error:captured', 'data');

    expect(h1).toHaveBeenCalledWith('data');
    expect(h2).toHaveBeenCalledWith('data');
  });

  it('on() returns unsubscribe function', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.on('error:captured', handler);
    unsub();
    bus.emit('error:captured', 'data');

    expect(handler).not.toHaveBeenCalled();
  });

  it('off() removes a specific handler', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on('error:captured', h1);
    bus.on('error:captured', h2);
    bus.off('error:captured', h1);
    bus.emit('error:captured', 'data');

    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledWith('data');
  });

  it('clear() removes all handlers', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on('error:captured', h1);
    bus.on('console:captured', h2);
    bus.clear();

    bus.emit('error:captured', 'data');
    bus.emit('console:captured', 'data');

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('does not crash if handler throws', () => {
    const bus = new EventBus();
    const badHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();

    bus.on('error:captured', badHandler);
    bus.on('error:captured', goodHandler);

    expect(() => bus.emit('error:captured', 'data')).not.toThrow();
    expect(goodHandler).toHaveBeenCalledWith('data');
  });

  it('emitting an event with no listeners does nothing', () => {
    const bus = new EventBus();
    expect(() => bus.emit('error:captured', 'data')).not.toThrow();
  });
});
