import type { Collector } from '../types';
import type { EventBus } from '../core/event-bus';

export class InteractionCollector implements Collector {
  readonly name = 'interactions';
  private handlers: { target: EventTarget; event: string; handler: EventListener }[] = [];
  private scrollTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private eventBus: EventBus) {}

  setup(): void {
    this.addHandler(window, 'scroll', this.onScroll.bind(this), { passive: true, capture: true });
    this.addHandler(document, 'input', this.onInput.bind(this), true);
    this.addHandler(document, 'change', this.onChange.bind(this), true);
    this.addHandler(window, 'popstate', this.onPopState.bind(this));
    this.addHandler(window, 'hashchange', this.onHashChange.bind(this));
    this.addHandler(document, 'visibilitychange', this.onVisibilityChange.bind(this));
    this.addHandler(window, 'resize', this.onResize.bind(this), { passive: true });
  }

  private addHandler(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);
    this.handlers.push({ target, event, handler });
  }

  private onScroll(): void {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      this.eventBus.emit('breadcrumb:added', {
        category: 'interaction',
        message: 'Scrolled',
        data: { x: window.scrollX, y: window.scrollY },
      });
    }, 300);
  }

  private onInput(e: Event): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const tag = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : '';
    const type = (target as HTMLInputElement).type
      ? `[type="${(target as HTMLInputElement).type}"]`
      : '';
    this.eventBus.emit('breadcrumb:added', {
      category: 'interaction',
      message: `Input on ${tag}${id}${type}`,
    });
  }

  private onChange(e: Event): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const tag = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : '';
    this.eventBus.emit('breadcrumb:added', {
      category: 'interaction',
      message: `Change on ${tag}${id}`,
    });
  }

  private onPopState(): void {
    this.eventBus.emit('breadcrumb:added', {
      category: 'navigation',
      message: `Navigated to ${window.location.href}`,
    });
  }

  private onHashChange(): void {
    this.eventBus.emit('breadcrumb:added', {
      category: 'navigation',
      message: `Hash changed to ${window.location.hash}`,
    });
  }

  private onVisibilityChange(): void {
    this.eventBus.emit('breadcrumb:added', {
      category: 'visibility',
      message: document.hidden ? 'Tab hidden' : 'Tab visible',
    });
  }

  private onResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.eventBus.emit('breadcrumb:added', {
        category: 'interaction',
        message: 'Window resized',
        data: { width: window.innerWidth, height: window.innerHeight },
      });
    }, 300);
  }

  teardown(): void {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.handlers.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });
    this.handlers = [];
  }
}
