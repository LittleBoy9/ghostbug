import type { Collector, PageContext } from '../types';

export class ContextCollector implements Collector {
  readonly name = 'context';

  setup(): void {
    // No listeners needed — snapshot utility only
  }

  teardown(): void {
    // No cleanup needed
  }

  snapshot(): PageContext {
    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      devicePixelRatio: window.devicePixelRatio || 1,
      timestamp: new Date().toISOString(),
      memory: (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          }
        : undefined,
    };
  }
}
