import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { init, getReports, toMarkdown, destroy } from '../../src/index';

describe('Full Lifecycle Integration', () => {
  beforeEach(() => {
    init({ collectors: { errors: true, console: false, network: false, clicks: false } });
  });

  afterEach(() => {
    destroy();
  });

  it('initializes and captures errors end-to-end', () => {
    // Trigger a window.onerror
    window.onerror?.('Integration test error', 'test.js', 10, 5, new Error('Integration test error'));

    const reports = getReports();
    expect(reports.length).toBeGreaterThanOrEqual(1);
    expect(reports[0].payload).toMatchObject({
      kind: 'error',
      message: 'Integration test error',
    });
    expect(reports[0].context).toHaveProperty('url');
    expect(reports[0].breadcrumbs).toBeDefined();
  });

  it('generates markdown from captured errors', () => {
    window.onerror?.('MD test error', 'test.js', 1, 1, new Error('MD test error'));

    const md = toMarkdown();
    expect(md).toContain('# Bug Report');
    expect(md).toContain('MD test error');
  });

  it('clears everything on destroy', () => {
    window.onerror?.('will be cleared', 'test.js', 1, 1, new Error('will be cleared'));

    destroy();

    expect(() => getReports()).toThrow('[ghostbug] Not initialized');
  });

  it('prevents double initialization', () => {
    // Should not throw, just warn silently
    expect(() => init()).not.toThrow();
  });
});
