import type { BugReport, WidgetOptions } from '../types';
import type { EventBus } from '../core/event-bus';
import type { ReportManager } from '../core/report-manager';
import { WIDGET_STYLES } from './widget-styles';
import { createFAB, createPanel, createReportItem } from './widget-template';
import { formatAsJSON } from '../formatters/json-formatter';
import { formatAsMarkdown } from '../formatters/markdown-formatter';

export class Widget {
  private hostElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private panel: HTMLDivElement | null = null;
  private badge: HTMLSpanElement | null = null;
  private reportList: HTMLDivElement | null = null;
  private isExpanded = false;
  private unsubscribers: (() => void)[] = [];

  constructor(
    private eventBus: EventBus,
    private reportManager: ReportManager,
    private options: Required<WidgetOptions>
  ) {}

  mount(): void {
    this.hostElement = document.createElement('div');
    this.hostElement.id = 'ghostbug-widget';

    const style = this.hostElement.style;
    style.position = 'fixed';
    style.zIndex = String(this.options.zIndex);
    style.margin = '0';
    style.padding = '0';

    this.applyPosition(style);

    this.shadowRoot = this.hostElement.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_STYLES;
    this.shadowRoot.appendChild(styleEl);

    // Build UI
    const container = document.createElement('div');
    container.className = 'gb-container';

    const fab = createFAB();
    this.badge = fab.querySelector('.gb-badge') as HTMLSpanElement;

    fab.addEventListener('click', () => this.toggle());
    container.appendChild(fab);

    this.panel = createPanel(this.options.position);
    container.appendChild(this.panel);

    // Wire up panel buttons
    const closeBtn = this.panel.querySelector('.gb-close-btn');
    closeBtn?.addEventListener('click', () => this.toggle());

    const copyBtn = this.panel.querySelector('.gb-copy-btn');
    copyBtn?.addEventListener('click', () => this.copyMarkdown());

    const downloadBtn = this.panel.querySelector('.gb-download-btn');
    downloadBtn?.addEventListener('click', () => this.downloadJSON());

    this.reportList = this.panel.querySelector('.gb-report-list');

    this.shadowRoot.appendChild(container);
    document.body.appendChild(this.hostElement);

    // Subscribe to live updates
    this.unsubscribers.push(
      this.eventBus.on('report:created', () => this.update()),
      this.eventBus.on('report:deduplicated', () => this.update())
    );

    if (!this.options.collapsed) {
      this.toggle();
    }
  }

  private applyPosition(style: CSSStyleDeclaration): void {
    const pos = this.options.position;
    style.top = pos.startsWith('top') ? '16px' : 'auto';
    style.bottom = pos.startsWith('bottom') ? '16px' : 'auto';
    style.left = pos.endsWith('left') ? '16px' : 'auto';
    style.right = pos.endsWith('right') ? '16px' : 'auto';
  }

  private toggle(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.panel?.classList.add('gb-open');
      this.renderReportList();
    } else {
      this.panel?.classList.remove('gb-open');
    }
  }

  private update(): void {
    this.updateBadge();
    if (this.isExpanded) {
      this.renderReportList();
    }
  }

  private updateBadge(): void {
    if (!this.badge) return;
    const count = this.reportManager.reportCount;
    this.badge.textContent = String(count);
    this.badge.setAttribute('data-count', String(count));
  }

  private renderReportList(): void {
    if (!this.reportList) return;

    // Clear existing
    this.reportList.textContent = '';

    const reports = this.reportManager.getReports();
    if (reports.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'gb-empty';
      empty.textContent = 'No bugs captured yet.';
      this.reportList.appendChild(empty);
      return;
    }

    // Render newest first
    const reversed = [...reports].reverse();
    reversed.forEach((report: BugReport) => {
      const item = createReportItem(report);
      this.reportList!.appendChild(item);
    });
  }

  private copyMarkdown(): void {
    const markdown = formatAsMarkdown(this.reportManager.getReports());
    navigator.clipboard.writeText(markdown).then(
      () => this.showToast('Copied to clipboard!'),
      () => this.showToast('Copy failed')
    );
  }

  private downloadJSON(): void {
    const json = formatAsJSON(this.reportManager.getReports());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ghostbug-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private showToast(message: string): void {
    if (!this.shadowRoot) return;

    const toast = document.createElement('div');
    toast.className = 'gb-toast';
    toast.textContent = message;
    this.shadowRoot.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('gb-show');
    });

    setTimeout(() => {
      toast.classList.remove('gb-show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  unmount(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
    this.hostElement?.remove();
    this.hostElement = null;
    this.shadowRoot = null;
    this.panel = null;
    this.badge = null;
    this.reportList = null;
  }
}
