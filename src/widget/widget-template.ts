import type {
  BugReport,
  ErrorPayload,
  ConsolePayload,
  NetworkPayload,
  PerformancePayload,
  MemoryPayload,
} from '../types';

const BUG_ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>`;


export function createFAB(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'gb-fab';
  btn.setAttribute('aria-label', 'ghostbug - bug reports');

  const iconSpan = document.createElement('span');
  iconSpan.innerHTML = BUG_ICON_SVG;
  btn.appendChild(iconSpan);

  const badge = document.createElement('span');
  badge.className = 'gb-badge';
  badge.setAttribute('data-count', '0');
  badge.textContent = '0';
  btn.appendChild(badge);

  return btn;
}

export function createPanel(position: string): HTMLDivElement {
  const panel = document.createElement('div');
  panel.className = `gb-panel gb-pos-${position}`;

  // Header
  const header = document.createElement('div');
  header.className = 'gb-header';

  const title = document.createElement('span');
  title.className = 'gb-header-title';
  title.textContent = 'ghostbug';
  header.appendChild(title);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'gb-header-btn gb-copy-btn';
  copyBtn.textContent = 'Copy MD';
  header.appendChild(copyBtn);

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'gb-header-btn gb-download-btn';
  downloadBtn.textContent = 'Export';
  header.appendChild(downloadBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'gb-close-btn';
  closeBtn.textContent = '\u00D7';
  closeBtn.setAttribute('aria-label', 'Close');
  header.appendChild(closeBtn);

  panel.appendChild(header);

  // Report list
  const reportList = document.createElement('div');
  reportList.className = 'gb-report-list';

  const empty = document.createElement('div');
  empty.className = 'gb-empty';
  empty.textContent = 'No bugs captured yet.';
  reportList.appendChild(empty);

  panel.appendChild(reportList);

  return panel;
}

export function createReportItem(report: BugReport): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'gb-report-item';

  // Summary row (always visible)
  const summary = document.createElement('div');
  summary.className = 'gb-report-summary';

  // Type badge
  const typeBadge = document.createElement('span');
  typeBadge.className = `gb-report-type gb-type-${report.payload.kind === 'error' ? 'error' : report.payload.kind}`;
  typeBadge.textContent = report.type;
  summary.appendChild(typeBadge);

  // Count
  if (report.count > 1) {
    const count = document.createElement('span');
    count.className = 'gb-report-count';
    count.textContent = `\u00D7${report.count}`;
    summary.appendChild(count);
  }

  // Message
  const message = document.createElement('div');
  message.className = 'gb-report-message';
  message.textContent = getReportMessage(report);
  summary.appendChild(message);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'gb-report-meta';
  const time = report.timestamp.split('T')[1]?.split('.')[0] || report.timestamp;
  meta.textContent = `${time} · ${report.context.url}`;
  summary.appendChild(meta);

  item.appendChild(summary);

  // Detail section (hidden by default, toggled on click)
  const detail = document.createElement('div');
  detail.className = 'gb-report-detail';

  // Payload details
  detail.appendChild(createPayloadDetail(report.payload));

  // User context
  if (report.context.user) {
    const userSection = document.createElement('div');
    userSection.className = 'gb-detail-section';
    userSection.innerHTML = `<div class="gb-detail-label">User</div><div class="gb-detail-value">${escapeHtml(JSON.stringify(report.context.user))}</div>`;
    detail.appendChild(userSection);
  }

  // Tags
  if (report.context.tags) {
    const tagsSection = document.createElement('div');
    tagsSection.className = 'gb-detail-section';
    tagsSection.innerHTML = `<div class="gb-detail-label">Tags</div><div class="gb-detail-value">${escapeHtml(JSON.stringify(report.context.tags))}</div>`;
    detail.appendChild(tagsSection);
  }

  // Breadcrumbs count
  if (report.breadcrumbs.length > 0) {
    const bcSection = document.createElement('div');
    bcSection.className = 'gb-detail-section';
    bcSection.innerHTML = `<div class="gb-detail-label">Breadcrumbs</div><div class="gb-detail-value">${report.breadcrumbs.length} events</div>`;
    detail.appendChild(bcSection);
  }

  item.appendChild(detail);

  // Toggle expand on click
  summary.addEventListener('click', () => {
    item.classList.toggle('gb-expanded');
  });

  return item;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createPayloadDetail(
  payload: ErrorPayload | ConsolePayload | NetworkPayload | PerformancePayload | MemoryPayload
): HTMLDivElement {
  const section = document.createElement('div');
  section.className = 'gb-detail-section';

  switch (payload.kind) {
    case 'error': {
      if (payload.stack) {
        const label = document.createElement('div');
        label.className = 'gb-detail-label';
        label.textContent = 'Stack Trace';
        section.appendChild(label);
        const pre = document.createElement('pre');
        pre.className = 'gb-detail-pre';
        pre.textContent = payload.stack;
        section.appendChild(pre);
      }
      if (payload.filename) {
        const loc = document.createElement('div');
        loc.className = 'gb-detail-value';
        loc.textContent = `${payload.filename}:${payload.lineno}:${payload.colno}`;
        section.appendChild(loc);
      }
      break;
    }
    case 'console': {
      const label = document.createElement('div');
      label.className = 'gb-detail-label';
      label.textContent = 'Output';
      section.appendChild(label);
      const pre = document.createElement('pre');
      pre.className = 'gb-detail-pre';
      pre.textContent = payload.args.join('\n');
      section.appendChild(pre);
      break;
    }
    case 'network': {
      section.innerHTML = `<div class="gb-detail-label">Request</div><div class="gb-detail-value">${escapeHtml(payload.method)} ${escapeHtml(payload.url)}<br>Status: ${payload.status} ${escapeHtml(payload.statusText)}<br>Duration: ${payload.duration}ms</div>`;
      break;
    }
    case 'performance': {
      section.innerHTML = `<div class="gb-detail-label">Performance</div><div class="gb-detail-value">Metric: ${escapeHtml(payload.metric)}<br>Value: ${payload.value}ms</div>`;
      break;
    }
    case 'memory': {
      section.innerHTML = `<div class="gb-detail-label">Memory</div><div class="gb-detail-value">Used: ${(payload.usedJSHeapSize / 1_048_576).toFixed(1)}MB<br>Limit: ${(payload.jsHeapSizeLimit / 1_048_576).toFixed(1)}MB<br>Usage: ${(payload.heapUsagePercent * 100).toFixed(1)}%</div>`;
      break;
    }
  }

  return section;
}

function getReportMessage(report: BugReport): string {
  switch (report.payload.kind) {
    case 'error':
      return report.payload.message;
    case 'console':
      return report.payload.args.join(', ');
    case 'network':
      return `${report.payload.method} ${report.payload.url} → ${report.payload.status}`;
    case 'performance':
      return `${report.payload.metric}: ${report.payload.value}ms`;
    case 'memory':
      return report.payload.message;
  }
}
