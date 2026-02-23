import type { BugReport } from '../types';

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

  // Type badge
  const typeBadge = document.createElement('span');
  typeBadge.className = `gb-report-type gb-type-${report.payload.kind === 'error' ? 'error' : report.payload.kind}`;
  typeBadge.textContent = report.type;
  item.appendChild(typeBadge);

  // Count
  if (report.count > 1) {
    const count = document.createElement('span');
    count.className = 'gb-report-count';
    count.textContent = `\u00D7${report.count}`;
    item.appendChild(count);
  }

  // Message
  const message = document.createElement('div');
  message.className = 'gb-report-message';
  message.textContent = getReportMessage(report);
  item.appendChild(message);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'gb-report-meta';
  const time = report.timestamp.split('T')[1]?.split('.')[0] || report.timestamp;
  meta.textContent = `${time} · ${report.context.url}`;
  item.appendChild(meta);

  return item;
}

function getReportMessage(report: BugReport): string {
  switch (report.payload.kind) {
    case 'error':
      return report.payload.message;
    case 'console':
      return report.payload.args.join(', ');
    case 'network':
      return `${report.payload.method} ${report.payload.url} → ${report.payload.status}`;
  }
}
