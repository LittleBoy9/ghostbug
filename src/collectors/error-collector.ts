import type { Collector, ErrorPayload } from '../types';
import type { EventBus } from '../core/event-bus';

export class ErrorCollector implements Collector {
  readonly name = 'error';
  private originalOnError: OnErrorEventHandler | null = null;
  private rejectionHandler: ((e: PromiseRejectionEvent) => void) | null = null;

  constructor(private eventBus: EventBus) {}

  setup(): void {
    this.originalOnError = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      const payload: ErrorPayload = {
        kind: 'error',
        message: String(message),
        stack: error?.stack,
        filename: source ?? undefined,
        lineno: lineno ?? undefined,
        colno: colno ?? undefined,
        name: error?.name,
      };

      this.eventBus.emit('error:captured', payload);

      if (this.originalOnError) {
        return (this.originalOnError as (...args: unknown[]) => unknown).call(window, message, source, lineno, colno, error);
      }
      return false;
    };

    this.rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const payload: ErrorPayload = {
        kind: 'error',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        name: reason instanceof Error ? reason.name : 'UnhandledRejection',
      };

      this.eventBus.emit('error:captured', payload);
    };

    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  teardown(): void {
    window.onerror = this.originalOnError;
    this.originalOnError = null;

    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
      this.rejectionHandler = null;
    }
  }
}
