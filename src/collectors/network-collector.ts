import type { Collector, NetworkPayload } from '../types';
import type { EventBus } from '../core/event-bus';

export class NetworkCollector implements Collector {
  readonly name = 'network';
  private originalFetch: typeof window.fetch | null = null;
  private originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXhrSend: typeof XMLHttpRequest.prototype.send | null = null;

  constructor(private eventBus: EventBus) {}

  setup(): void {
    this.patchFetch();
    this.patchXHR();
  }

  private patchFetch(): void {
    this.originalFetch = window.fetch;
    const eventBus = this.eventBus;
    const originalFetch = this.originalFetch;

    window.fetch = function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const method = init?.method?.toUpperCase() || 'GET';
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const startTime = performance.now();

      return originalFetch.call(window, input, init).then(
        (response) => {
          const duration = Math.round(performance.now() - startTime);

          if (response.status >= 400) {
            const payload: NetworkPayload = {
              kind: 'network',
              method,
              url,
              status: response.status,
              statusText: response.statusText,
              duration,
            };
            eventBus.emit('network:captured', payload);
          }

          eventBus.emit('breadcrumb:added', {
            category: 'network',
            message: `${method} ${url} -> ${response.status}`,
          });

          return response;
        },
        (error) => {
          const duration = Math.round(performance.now() - startTime);
          const payload: NetworkPayload = {
            kind: 'network',
            method,
            url,
            status: 0,
            statusText: error.message || 'Network Error',
            duration,
          };
          eventBus.emit('network:captured', payload);
          throw error;
        }
      );
    };
  }

  private patchXHR(): void {
    this.originalXhrOpen = XMLHttpRequest.prototype.open;
    this.originalXhrSend = XMLHttpRequest.prototype.send;
    const eventBus = this.eventBus;
    const origOpen = this.originalXhrOpen;
    const origSend = this.originalXhrSend;

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: any[]
    ) {
      (this as any).__ghostbug_method = method.toUpperCase();
      (this as any).__ghostbug_url = String(url);
      return (origOpen as any).apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null
    ) {
      const startTime = performance.now();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const xhr = this;

      xhr.addEventListener('loadend', function () {
        const duration = Math.round(performance.now() - startTime);
        const method = (xhr as any).__ghostbug_method || 'UNKNOWN';
        const url = (xhr as any).__ghostbug_url || '';

        if (xhr.status >= 400 || xhr.status === 0) {
          const payload: NetworkPayload = {
            kind: 'network',
            method,
            url,
            status: xhr.status,
            statusText: xhr.statusText,
            duration,
          };
          eventBus.emit('network:captured', payload);
        }

        eventBus.emit('breadcrumb:added', {
          category: 'network',
          message: `${method} ${url} -> ${xhr.status}`,
        });
      });

      return origSend.call(this, body);
    };
  }

  teardown(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    if (this.originalXhrOpen) {
      XMLHttpRequest.prototype.open = this.originalXhrOpen as any;
      this.originalXhrOpen = null;
    }
    if (this.originalXhrSend) {
      XMLHttpRequest.prototype.send = this.originalXhrSend;
      this.originalXhrSend = null;
    }
  }
}
