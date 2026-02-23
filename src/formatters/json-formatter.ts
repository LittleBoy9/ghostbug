import type { BugReport } from '../types';
import { VERSION } from '../constants';
import { safeStringify } from '../utils/safe-stringify';

export function formatAsJSON(reports: BugReport[]): string {
  return safeStringify(
    {
      generator: 'ghostbug',
      version: VERSION,
      exportedAt: new Date().toISOString(),
      reportCount: reports.length,
      reports,
    },
    2
  );
}
