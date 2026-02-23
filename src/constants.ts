import type { GhostbugOptions } from './types';

export const VERSION = '0.1.0';

export const DEFAULT_OPTIONS: Omit<Required<GhostbugOptions>, 'screenshotFn'> = {
  maxReports: 50,
  maxBreadcrumbs: 20,
  maxClicks: 20,
  widget: false,
  collectors: { errors: true, console: true, network: true, clicks: true, interactions: true, performance: true, memory: true },
  rateLimit: { maxEvents: 10, windowMs: 1000 },
  beforeReport: (r) => r,
  debug: false,
};
