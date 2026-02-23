import type {
  BugReport,
  ErrorPayload,
  ConsolePayload,
  NetworkPayload,
  PerformancePayload,
  MemoryPayload,
} from '../types';
import { VERSION } from '../constants';

export function formatAsMarkdown(reports: BugReport[]): string {
  const lines: string[] = [];

  lines.push(`# Bug Report — ghostbug v${VERSION}`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Reports:** ${reports.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  reports.forEach((report, idx) => {
    lines.push(`## ${idx + 1}. ${formatTitle(report)}`);
    lines.push('');
    lines.push(`- **Type:** ${report.type}`);
    lines.push(`- **Time:** ${report.timestamp}`);
    lines.push(`- **Occurrences:** ${report.count}`);
    lines.push(`- **URL:** ${report.context.url}`);
    lines.push(
      `- **Browser:** ${parseBrowser(report.context.userAgent)}`
    );
    lines.push(
      `- **Viewport:** ${report.context.viewport.width}x${report.context.viewport.height}`
    );
    lines.push('');

    // Payload details
    lines.push(...formatPayload(report.payload));
    lines.push('');

    // Breadcrumbs
    if (report.breadcrumbs.length > 0) {
      lines.push('### Breadcrumbs');
      lines.push('');
      lines.push('| Time | Category | Event |');
      lines.push('|------|----------|-------|');
      report.breadcrumbs.forEach((bc) => {
        const time = bc.timestamp.split('T')[1]?.split('.')[0] || bc.timestamp;
        lines.push(`| ${time} | ${bc.category} | ${bc.message} |`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

function formatTitle(report: BugReport): string {
  switch (report.payload.kind) {
    case 'error':
      return `${report.payload.name || 'Error'}: ${report.payload.message}`;
    case 'console':
      return `Console ${report.payload.level}: ${report.payload.args[0] || ''}`;
    case 'network':
      return `${report.payload.method} ${report.payload.url} → ${report.payload.status}`;
    case 'performance':
      return `Performance: ${report.payload.metric} ${report.payload.value}ms`;
    case 'memory':
      return `Memory: ${report.payload.message}`;
  }
}

function formatPayload(
  payload: ErrorPayload | ConsolePayload | NetworkPayload | PerformancePayload | MemoryPayload
): string[] {
  const lines: string[] = [];

  switch (payload.kind) {
    case 'error':
      if (payload.stack) {
        lines.push('### Stack Trace');
        lines.push('');
        lines.push('```');
        lines.push(payload.stack);
        lines.push('```');
      }
      if (payload.filename) {
        lines.push(`**File:** ${payload.filename}:${payload.lineno}:${payload.colno}`);
      }
      break;

    case 'console':
      lines.push('### Console Output');
      lines.push('');
      lines.push('```');
      payload.args.forEach((arg) => lines.push(arg));
      lines.push('```');
      break;

    case 'network':
      lines.push('### Network Details');
      lines.push('');
      lines.push(`- **Method:** ${payload.method}`);
      lines.push(`- **URL:** ${payload.url}`);
      lines.push(`- **Status:** ${payload.status} ${payload.statusText}`);
      lines.push(`- **Duration:** ${payload.duration}ms`);
      break;

    case 'performance':
      lines.push('### Performance Details');
      lines.push('');
      lines.push(`- **Metric:** ${payload.metric}`);
      lines.push(`- **Value:** ${payload.value}ms`);
      if (payload.entries.length > 0) {
        lines.push(`- **Start Time:** ${Math.round(payload.entries[0].startTime)}ms`);
      }
      break;

    case 'memory':
      lines.push('### Memory Details');
      lines.push('');
      lines.push(`- **Used:** ${(payload.usedJSHeapSize / 1_048_576).toFixed(1)}MB`);
      lines.push(`- **Limit:** ${(payload.jsHeapSizeLimit / 1_048_576).toFixed(1)}MB`);
      lines.push(`- **Usage:** ${(payload.heapUsagePercent * 100).toFixed(1)}%`);
      lines.push(`- **Growth since init:** ${(payload.heapGrowthPercent * 100).toFixed(1)}%`);
      break;
  }

  return lines;
}

function parseBrowser(ua: string): string {
  if (ua.includes('Chrome')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return match ? `Chrome ${match[1]}` : 'Chrome';
  }
  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return match ? `Firefox ${match[1]}` : 'Firefox';
  }
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return match ? `Safari ${match[1]}` : 'Safari';
  }
  return ua.slice(0, 50);
}
