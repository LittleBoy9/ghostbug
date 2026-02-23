import { describe, it, expect, afterEach, vi } from 'vitest';
import { init, getReports, onBug, destroy } from '../../src/index';

describe('Screenshot Capture Hook', () => {
  afterEach(() => {
    destroy();
    vi.useRealTimers();
  });

  it('attaches screenshot to report when screenshotFn resolves', async () => {
    const screenshotFn = vi.fn().mockResolvedValue('data:image/png;base64,abc123');

    init({
      collectors: { errors: true, console: false, network: false, clicks: false, interactions: false, performance: false, memory: false },
      screenshotFn,
    });

    const reports: unknown[] = [];
    onBug((report) => reports.push(report));

    window.onerror?.('screenshot test', 'test.js', 1, 1, new Error('screenshot test'));

    // Wait for async handleCapturedEvent
    await vi.waitFor(() => expect(reports.length).toBe(1));

    expect(screenshotFn).toHaveBeenCalled();
    expect((reports[0] as any).screenshot).toBe('data:image/png;base64,abc123');
  });

  it('creates report without screenshot when screenshotFn is not provided', async () => {
    init({
      collectors: { errors: true, console: false, network: false, clicks: false, interactions: false, performance: false, memory: false },
    });

    const reports: unknown[] = [];
    onBug((report) => reports.push(report));

    window.onerror?.('no screenshot', 'test.js', 1, 1, new Error('no screenshot'));

    await vi.waitFor(() => expect(reports.length).toBe(1));

    expect((reports[0] as any).screenshot).toBeUndefined();
  });

  it('creates report without screenshot when screenshotFn throws', async () => {
    const screenshotFn = vi.fn().mockRejectedValue(new Error('canvas failed'));

    init({
      collectors: { errors: true, console: false, network: false, clicks: false, interactions: false, performance: false, memory: false },
      screenshotFn,
    });

    const reports: unknown[] = [];
    onBug((report) => reports.push(report));

    window.onerror?.('failing screenshot', 'test.js', 1, 1, new Error('failing screenshot'));

    await vi.waitFor(() => expect(reports.length).toBe(1));

    expect(screenshotFn).toHaveBeenCalled();
    expect((reports[0] as any).screenshot).toBeUndefined();
  });

  it('times out after 3 seconds if screenshotFn hangs', async () => {
    vi.useFakeTimers();

    const screenshotFn = vi.fn().mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    init({
      collectors: { errors: true, console: false, network: false, clicks: false, interactions: false, performance: false, memory: false },
      screenshotFn,
    });

    window.onerror?.('timeout test', 'test.js', 1, 1, new Error('timeout test'));

    // Advance past the 3s timeout
    await vi.advanceTimersByTimeAsync(3500);

    const reports = getReports();
    expect(reports.length).toBe(1);
    expect(reports[0].screenshot).toBeUndefined();
  });
});
