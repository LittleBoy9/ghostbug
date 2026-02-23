import type { Collector, ConsolePayload } from '../types';
import type { EventBus } from '../core/event-bus';
import { safeStringify } from '../utils/safe-stringify';

export class ConsoleCollector implements Collector {
  readonly name = 'console';
  private originalError: typeof console.error | null = null;
  private originalWarn: typeof console.warn | null = null;

  constructor(private eventBus: EventBus) {}

  setup(): void {
    this.originalError = console.error;
    this.originalWarn = console.warn;

    console.error = (...args: unknown[]) => {
      const payload: ConsolePayload = {
        kind: 'console',
        level: 'error',
        args: args.map((a) => safeStringify(a)),
      };
      this.eventBus.emit('console:captured', payload);
      this.originalError!.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      const payload: ConsolePayload = {
        kind: 'console',
        level: 'warn',
        args: args.map((a) => safeStringify(a)),
      };
      this.eventBus.emit('console:captured', payload);
      this.originalWarn!.apply(console, args);
    };
  }

  teardown(): void {
    if (this.originalError) console.error = this.originalError;
    if (this.originalWarn) console.warn = this.originalWarn;
    this.originalError = null;
    this.originalWarn = null;
  }
}
