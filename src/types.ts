// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

export interface GhostbugOptions {
  /** Maximum number of bug reports retained. Default: 50 */
  maxReports?: number;
  /** Maximum breadcrumb events per report. Default: 20 */
  maxBreadcrumbs?: number;
  /** Maximum click trail entries. Default: 20 */
  maxClicks?: number;
  /** Enable the floating widget UI. Default: false */
  widget?: boolean | WidgetOptions;
  /** Which collectors to enable. Default: all true */
  collectors?: CollectorToggle;
  /** Rate limit config. Default: { maxEvents: 10, windowMs: 1000 } */
  rateLimit?: RateLimitConfig;
  /** Filter function — return false/null to discard a report */
  beforeReport?: (report: BugReport) => BugReport | false | null;
  /** Enable SDK debug logging. Default: false */
  debug?: boolean;
  /** Async function that returns a screenshot data URL. Called on each new bug report. */
  screenshotFn?: () => Promise<string>;
}

export interface CollectorToggle {
  errors?: boolean;
  console?: boolean;
  network?: boolean;
  clicks?: boolean;
  interactions?: boolean;
  performance?: boolean;
  memory?: boolean;
}

export interface RateLimitConfig {
  maxEvents: number;
  windowMs: number;
}

export interface WidgetOptions {
  /** Position on screen. Default: 'bottom-right' */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Initial collapsed state. Default: true */
  collapsed?: boolean;
  /** Custom z-index. Default: 2147483647 */
  zIndex?: number;
}

// ──────────────────────────────────────────────
// Bug Report Data Model
// ──────────────────────────────────────────────

export type BugReportType = 'error' | 'unhandled-rejection' | 'console' | 'network' | 'performance' | 'memory';

export interface BugReport {
  id: string;
  fingerprint: string;
  type: BugReportType;
  timestamp: string;
  count: number;
  payload: ErrorPayload | ConsolePayload | NetworkPayload | PerformancePayload | MemoryPayload;
  breadcrumbs: Breadcrumb[];
  context: PageContext;
  screenshot?: string;
}

// ──────────────────────────────────────────────
// Payload Variants
// ──────────────────────────────────────────────

export interface ErrorPayload {
  kind: 'error';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  name?: string;
}

export interface ConsolePayload {
  kind: 'console';
  level: 'error' | 'warn';
  args: string[];
}

export interface NetworkPayload {
  kind: 'network';
  method: string;
  url: string;
  status: number;
  statusText: string;
  duration: number;
}

export interface PerformancePayload {
  kind: 'performance';
  metric: string;
  value: number;
  entries: PerformanceEntryData[];
}

export interface PerformanceEntryData {
  name: string;
  duration: number;
  startTime: number;
}

export interface MemoryPayload {
  kind: 'memory';
  message: string;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  heapUsagePercent: number;
  heapGrowthPercent: number;
}

// ──────────────────────────────────────────────
// Breadcrumbs
// ──────────────────────────────────────────────

export type BreadcrumbCategory =
  | 'click'
  | 'navigation'
  | 'console'
  | 'network'
  | 'error'
  | 'interaction'
  | 'visibility'
  | 'performance'
  | 'memory';

export interface Breadcrumb {
  timestamp: string;
  category: BreadcrumbCategory;
  message: string;
  data?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Page Context
// ──────────────────────────────────────────────

export interface PageContext {
  url: string;
  referrer: string;
  userAgent: string;
  language: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  devicePixelRatio: number;
  timestamp: string;
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
  user?: Record<string, unknown>;
  tags?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Click Trail
// ──────────────────────────────────────────────

export interface ClickEntry {
  timestamp: string;
  selector: string;
  tagName: string;
  text: string;
  position: { x: number; y: number };
}

// ──────────────────────────────────────────────
// Internal Types
// ──────────────────────────────────────────────

export type EventType =
  | 'error:captured'
  | 'console:captured'
  | 'network:captured'
  | 'click:captured'
  | 'performance:captured'
  | 'memory:captured'
  | 'report:created'
  | 'report:deduplicated'
  | 'breadcrumb:added';

export interface Collector {
  readonly name: string;
  setup(): void;
  teardown(): void;
}

export type BugCallback = (report: BugReport) => void;
