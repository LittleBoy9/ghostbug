import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { init, getReports, destroy } from '../../src/index';

describe('Deduplication', () => {
  beforeEach(() => {
    init({ collectors: { errors: true, console: false, network: false, clicks: false } });
  });

  afterEach(() => {
    destroy();
  });

  it('deduplicates identical errors', () => {
    const error = new Error('Duplicate error');

    for (let i = 0; i < 5; i++) {
      window.onerror?.('Duplicate error', 'test.js', 10, 5, error);
    }

    const reports = getReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].count).toBe(5);
  });

  it('does not deduplicate different errors', () => {
    window.onerror?.('Error A', 'a.js', 1, 1, new Error('Error A'));
    window.onerror?.('Error B', 'b.js', 2, 2, new Error('Error B'));

    const reports = getReports();
    expect(reports).toHaveLength(2);
    expect(reports[0].count).toBe(1);
    expect(reports[1].count).toBe(1);
  });
});
