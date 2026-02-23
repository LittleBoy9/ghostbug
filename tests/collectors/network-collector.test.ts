import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus';
import { NetworkCollector } from '../../src/collectors/network-collector';

describe('NetworkCollector', () => {
  let eventBus: EventBus;
  let collector: NetworkCollector;
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    eventBus = new EventBus();
  });

  afterEach(() => {
    collector.teardown();
    window.fetch = originalFetch;
  });

  it('captures failed fetch requests (4xx)', async () => {
    const captured: unknown[] = [];
    eventBus.on('network:captured', (payload) => captured.push(payload));

    // Set up a mock fetch BEFORE the collector patches it
    window.fetch = vi.fn().mockResolvedValue(
      new Response('Not found', { status: 404, statusText: 'Not Found' })
    );

    collector = new NetworkCollector(eventBus);
    collector.setup();

    await window.fetch('http://localhost/api/missing');

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      kind: 'network',
      method: 'GET',
      url: 'http://localhost/api/missing',
      status: 404,
    });
  });

  it('does not capture successful fetch requests', async () => {
    const captured: unknown[] = [];
    eventBus.on('network:captured', (payload) => captured.push(payload));

    window.fetch = vi.fn().mockResolvedValue(
      new Response('OK', { status: 200, statusText: 'OK' })
    );

    collector = new NetworkCollector(eventBus);
    collector.setup();

    await window.fetch('http://localhost/api/ok');

    expect(captured).toHaveLength(0);
  });

  it('emits breadcrumbs for all fetch requests', async () => {
    const breadcrumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (bc) => breadcrumbs.push(bc));

    window.fetch = vi.fn().mockResolvedValue(
      new Response('OK', { status: 200, statusText: 'OK' })
    );

    collector = new NetworkCollector(eventBus);
    collector.setup();

    await window.fetch('http://localhost/api/ok');

    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toMatchObject({
      category: 'network',
    });
  });

  it('captures fetch network errors', async () => {
    const captured: unknown[] = [];
    eventBus.on('network:captured', (payload) => captured.push(payload));

    window.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    collector = new NetworkCollector(eventBus);
    collector.setup();

    await expect(window.fetch('http://localhost/api/fail')).rejects.toThrow('Network Error');

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      status: 0,
      statusText: 'Network Error',
    });
  });

  it('restores original fetch on teardown', () => {
    const mockFetch = vi.fn();
    window.fetch = mockFetch;

    collector = new NetworkCollector(eventBus);
    collector.setup();
    collector.teardown();

    expect(window.fetch).toBe(mockFetch);
  });
});
