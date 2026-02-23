import { describe, it, expect } from 'vitest';
import { formatAsMarkdown } from '../../src/formatters/markdown-formatter';
import type { BugReport } from '../../src/types';

const makeReport = (overrides: Partial<BugReport> = {}): BugReport => ({
  id: 'test-id',
  fingerprint: 'fp1',
  type: 'error',
  timestamp: '2026-01-01T12:00:00.000Z',
  count: 1,
  payload: {
    kind: 'error',
    message: 'Cannot read property x',
    name: 'TypeError',
    stack: 'TypeError: Cannot read property x\n    at foo (app.js:12:5)',
  },
  breadcrumbs: [
    {
      timestamp: '2026-01-01T11:59:59.000Z',
      category: 'click',
      message: 'Clicked button "Submit"',
    },
  ],
  context: {
    url: 'http://localhost/dashboard',
    referrer: '',
    userAgent: 'Mozilla/5.0 Chrome/122',
    language: 'en',
    viewport: { width: 1440, height: 900 },
    screen: { width: 1920, height: 1080 },
    devicePixelRatio: 2,
    timestamp: '2026-01-01T12:00:00.000Z',
  },
  ...overrides,
});

describe('formatAsMarkdown', () => {
  it('generates markdown with report title', () => {
    const md = formatAsMarkdown([makeReport()]);

    expect(md).toContain('# Bug Report');
    expect(md).toContain('TypeError: Cannot read property x');
  });

  it('includes breadcrumb table', () => {
    const md = formatAsMarkdown([makeReport()]);

    expect(md).toContain('### Breadcrumbs');
    expect(md).toContain('| Time | Category | Event |');
    expect(md).toContain('Clicked button "Submit"');
  });

  it('includes stack trace in code block', () => {
    const md = formatAsMarkdown([makeReport()]);

    expect(md).toContain('### Stack Trace');
    expect(md).toContain('```');
    expect(md).toContain('at foo (app.js:12:5)');
  });

  it('formats network reports', () => {
    const report = makeReport({
      type: 'network',
      payload: {
        kind: 'network',
        method: 'POST',
        url: '/api/login',
        status: 500,
        statusText: 'Internal Server Error',
        duration: 234,
      },
    });

    const md = formatAsMarkdown([report]);

    expect(md).toContain('POST /api/login');
    expect(md).toContain('500');
    expect(md).toContain('234ms');
  });

  it('formats console reports', () => {
    const report = makeReport({
      type: 'console',
      payload: {
        kind: 'console',
        level: 'error',
        args: ['something broke'],
      },
    });

    const md = formatAsMarkdown([report]);
    expect(md).toContain('something broke');
  });

  it('handles empty reports', () => {
    const md = formatAsMarkdown([]);

    expect(md).toContain('**Reports:** 0');
  });

  it('shows occurrence count', () => {
    const md = formatAsMarkdown([makeReport({ count: 5 })]);
    expect(md).toContain('**Occurrences:** 5');
  });
});
