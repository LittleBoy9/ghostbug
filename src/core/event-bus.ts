import type { EventType } from '../types';

type Handler = (data: any) => void;

export class EventBus {
  private listeners = new Map<EventType, Set<Handler>>();

  on(event: EventType, handler: Handler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  off(event: EventType, handler: Handler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: EventType, data?: unknown): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch {
        // Never let a handler crash the event bus
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
