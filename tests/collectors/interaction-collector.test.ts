import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractionCollector } from '../../src/collectors/interaction-collector';
import { EventBus } from '../../src/core/event-bus';

describe('InteractionCollector', () => {
  let eventBus: EventBus;
  let collector: InteractionCollector;

  beforeEach(() => {
    vi.useFakeTimers();
    eventBus = new EventBus();
    collector = new InteractionCollector(eventBus);
    collector.setup();
  });

  afterEach(() => {
    collector.teardown();
    vi.useRealTimers();
  });

  it('emits breadcrumb on popstate', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    window.dispatchEvent(new Event('popstate'));

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'navigation',
      message: expect.stringContaining('Navigated to'),
    });
  });

  it('emits breadcrumb on hashchange', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'navigation',
      message: expect.stringContaining('Hash changed to'),
    });
  });

  it('emits breadcrumb on visibilitychange', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(events[0]).toMatchObject({
      category: 'visibility',
      message: 'Tab hidden',
    });

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(events[1]).toMatchObject({
      category: 'visibility',
      message: 'Tab visible',
    });
  });

  it('emits breadcrumb on input without capturing value', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'email';
    document.body.appendChild(input);

    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'interaction',
      message: 'Input on input#email[type="text"]',
    });
    // Ensure value is never captured
    expect(JSON.stringify(events[0])).not.toContain('value');

    document.body.removeChild(input);
  });

  it('emits breadcrumb on change', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    const select = document.createElement('select');
    select.id = 'role';
    document.body.appendChild(select);

    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'interaction',
      message: 'Change on select#role',
    });

    document.body.removeChild(select);
  });

  it('emits debounced breadcrumb for scroll', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(events.length).toBe(0);

    vi.advanceTimersByTime(300);

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'interaction',
      message: 'Scrolled',
    });
  });

  it('emits debounced breadcrumb for resize', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    window.dispatchEvent(new Event('resize'));

    expect(events.length).toBe(0);

    vi.advanceTimersByTime(300);

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      category: 'interaction',
      message: 'Window resized',
    });
  });

  it('removes all event listeners on teardown', () => {
    const events: unknown[] = [];
    eventBus.on('breadcrumb:added', (data) => events.push(data));

    collector.teardown();

    window.dispatchEvent(new Event('popstate'));
    document.dispatchEvent(new Event('visibilitychange'));

    expect(events.length).toBe(0);
  });
});
