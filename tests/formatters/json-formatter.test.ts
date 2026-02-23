import { describe, it, expect } from 'vitest';
import { formatAsJSON } from '../../src/formatters/json-formatter';
import type { BugReport } from '../../src/types';

describe('formatAsJSON', () => {
  it('formats reports as valid JSON with metadata', () => {
    const reports: BugReport[] = [
      {
        id: 'test-id',
        fingerprint: 'fp1',
        type: 'error',
        timestamp: '2026-01-01T00:00:00.000Z',
        count: 1,
        payload: {
          kind: 'error',
          message: 'Test error',
          name: 'Error',
        },
        breadcrumbs: [],
        context: {
          url: 'http://localhost',
          referrer: '',
          userAgent: 'test',
          language: 'en',
          viewport: { width: 1024, height: 768 },
          screen: { width: 1920, height: 1080 },
          devicePixelRatio: 1,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    ];

    const json = formatAsJSON(reports);
    const parsed = JSON.parse(json);

    expect(parsed.generator).toBe('ghostbug');
    expect(parsed.version).toBe('0.1.0');
    expect(parsed.reportCount).toBe(1);
    expect(parsed.reports).toHaveLength(1);
    expect(parsed.reports[0].payload.message).toBe('Test error');
  });

  it('outputs empty reports array when no reports', () => {
    const json = formatAsJSON([]);
    const parsed = JSON.parse(json);

    expect(parsed.reportCount).toBe(0);
    expect(parsed.reports).toEqual([]);
  });
});
