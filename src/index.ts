import type {
  GhostbugOptions,
  BugReport,
  BugCallback,
  Collector,
  WidgetOptions,
  CollectorToggle,
  RateLimitConfig,
} from './types';
import { DEFAULT_OPTIONS } from './constants';
import { EventBus } from './core/event-bus';
import { ReportManager } from './core/report-manager';
import { ErrorCollector } from './collectors/error-collector';
import { ConsoleCollector } from './collectors/console-collector';
import { NetworkCollector } from './collectors/network-collector';
import { ClickCollector } from './collectors/click-collector';
import { ContextCollector } from './collectors/context-collector';
import { Widget } from './widget/widget';
import { formatAsJSON } from './formatters/json-formatter';
import { formatAsMarkdown } from './formatters/markdown-formatter';

let eventBus: EventBus | null = null;
let reportManager: ReportManager | null = null;
let collectors: Collector[] = [];
let widget: Widget | null = null;
const bugCallbacks = new Set<BugCallback>();
let initialized = false;

function mergeOptions(
  defaults: Required<GhostbugOptions>,
  user?: GhostbugOptions
): Required<GhostbugOptions> {
  if (!user) return { ...defaults };

  return {
    maxReports: user.maxReports ?? defaults.maxReports,
    maxBreadcrumbs: user.maxBreadcrumbs ?? defaults.maxBreadcrumbs,
    maxClicks: user.maxClicks ?? defaults.maxClicks,
    widget: user.widget ?? defaults.widget,
    collectors: { ...defaults.collectors, ...user.collectors } as Required<CollectorToggle>,
    rateLimit: { ...defaults.rateLimit, ...user.rateLimit } as Required<RateLimitConfig>,
    beforeReport: user.beforeReport ?? defaults.beforeReport,
    debug: user.debug ?? defaults.debug,
  };
}

export function init(options?: GhostbugOptions): void {
  if (initialized) {
    if (options?.debug) console.warn('[ghostbug] Already initialized. Call destroy() first.');
    return;
  }

  const opts = mergeOptions(DEFAULT_OPTIONS, options);

  eventBus = new EventBus();
  const contextCollector = new ContextCollector();
  reportManager = new ReportManager(eventBus, contextCollector, opts);

  if (opts.collectors.errors) collectors.push(new ErrorCollector(eventBus));
  if (opts.collectors.console) collectors.push(new ConsoleCollector(eventBus));
  if (opts.collectors.network) collectors.push(new NetworkCollector(eventBus));
  if (opts.collectors.clicks) collectors.push(new ClickCollector(eventBus, opts.maxClicks));
  collectors.push(contextCollector);

  collectors.forEach((c) => c.setup());

  // Wire up onBug callbacks
  eventBus.on('report:created', (report: BugReport) => {
    bugCallbacks.forEach((cb) => {
      try {
        cb(report);
      } catch {
        // Never let user callback crash SDK
      }
    });
  });

  // Optional widget
  if (opts.widget) {
    const widgetOpts: Required<WidgetOptions> =
      typeof opts.widget === 'object'
        ? {
            position: opts.widget.position || 'bottom-right',
            collapsed: opts.widget.collapsed ?? true,
            zIndex: opts.widget.zIndex ?? 2147483647,
          }
        : { position: 'bottom-right', collapsed: true, zIndex: 2147483647 };

    widget = new Widget(eventBus, reportManager, widgetOpts);
    widget.mount();
  }

  initialized = true;
}

export function getReports(): BugReport[] {
  assertInitialized();
  return reportManager!.getReports();
}

export function download(filename = 'ghostbug-report.json'): void {
  assertInitialized();
  const json = formatAsJSON(reportManager!.getReports());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toMarkdown(): string {
  assertInitialized();
  return formatAsMarkdown(reportManager!.getReports());
}

export function onBug(callback: BugCallback): () => void {
  bugCallbacks.add(callback);
  return () => bugCallbacks.delete(callback);
}

export function destroy(): void {
  widget?.unmount();
  widget = null;

  collectors.forEach((c) => c.teardown());
  collectors = [];

  eventBus?.clear();
  eventBus = null;

  reportManager?.clear();
  reportManager = null;

  bugCallbacks.clear();
  initialized = false;
}

function assertInitialized(): void {
  if (!initialized) {
    throw new Error('[ghostbug] Not initialized. Call ghostbug.init() first.');
  }
}

// Re-export types for consumers
export type {
  GhostbugOptions,
  BugReport,
  BugCallback,
  WidgetOptions,
  ErrorPayload,
  ConsolePayload,
  NetworkPayload,
  Breadcrumb,
  PageContext,
  ClickEntry,
} from './types';

// Default export for IIFE/script tag usage
export default { init, getReports, download, toMarkdown, onBug, destroy };
