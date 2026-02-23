import type {
  BugReport,
  BugReportType,
  Breadcrumb,
  ErrorPayload,
  ConsolePayload,
  NetworkPayload,
  GhostbugOptions,
} from '../types';
import { EventBus } from './event-bus';
import { RingBuffer } from './ring-buffer';
import { RateLimiter } from './rate-limiter';
import { ContextCollector } from '../collectors/context-collector';
import { computeFingerprint } from '../utils/fingerprint';
import { generateId } from '../utils/id';

export class ReportManager {
  private reports: RingBuffer<BugReport>;
  private breadcrumbs: RingBuffer<Breadcrumb>;
  private rateLimiter: RateLimiter;
  private unsubscribers: (() => void)[] = [];

  constructor(
    private eventBus: EventBus,
    private contextCollector: ContextCollector,
    private options: Required<GhostbugOptions>
  ) {
    this.reports = new RingBuffer<BugReport>(options.maxReports);
    this.breadcrumbs = new RingBuffer<Breadcrumb>(options.maxBreadcrumbs);
    this.rateLimiter = new RateLimiter(
      options.rateLimit.maxEvents,
      options.rateLimit.windowMs
    );

    this.subscribe();
  }

  private subscribe(): void {
    this.unsubscribers.push(
      this.eventBus.on('error:captured', (payload: ErrorPayload) => {
        this.addBreadcrumb({ category: 'error', message: payload.message });
        this.handleCapturedEvent('error', payload);
      }),
      this.eventBus.on('console:captured', (payload: ConsolePayload) => {
        this.addBreadcrumb({
          category: 'console',
          message: `console.${payload.level}: ${payload.args.join(', ')}`,
        });
        if (payload.level === 'error') {
          this.handleCapturedEvent('console', payload);
        }
      }),
      this.eventBus.on('network:captured', (payload: NetworkPayload) => {
        this.handleCapturedEvent('network', payload);
      }),
      this.eventBus.on('breadcrumb:added', (data: Omit<Breadcrumb, 'timestamp'>) => {
        this.addBreadcrumb(data);
      })
    );
  }

  private handleCapturedEvent(
    type: BugReportType,
    payload: ErrorPayload | ConsolePayload | NetworkPayload
  ): void {
    if (!this.rateLimiter.allow()) return;

    const fingerprint = computeFingerprint(payload);

    // Check for dedup
    const existing = this.reports.find((r) => r.fingerprint === fingerprint);
    if (existing) {
      existing.count++;
      existing.timestamp = new Date().toISOString();
      this.eventBus.emit('report:deduplicated', existing);
      return;
    }

    // Assemble new report
    let report: BugReport = {
      id: generateId(),
      fingerprint,
      type,
      timestamp: new Date().toISOString(),
      count: 1,
      payload,
      breadcrumbs: this.breadcrumbs.toArray(),
      context: this.contextCollector.snapshot(),
    };

    // Run beforeReport filter
    const filtered = this.options.beforeReport(report);
    if (!filtered) return;
    report = filtered as BugReport;

    this.reports.push(report);
    this.eventBus.emit('report:created', report);
  }

  addBreadcrumb(crumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...crumb,
      timestamp: new Date().toISOString(),
    });
  }

  getReports(): BugReport[] {
    return this.reports.toArray();
  }

  clear(): void {
    this.reports.clear();
    this.breadcrumbs.clear();
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }

  get reportCount(): number {
    return this.reports.size;
  }
}
