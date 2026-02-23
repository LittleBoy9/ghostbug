import type { Collector, ClickEntry } from '../types';
import type { EventBus } from '../core/event-bus';
import { RingBuffer } from '../core/ring-buffer';
import { generateSelector } from '../utils/selector';

export class ClickCollector implements Collector {
  readonly name = 'click';
  private clicks: RingBuffer<ClickEntry>;
  private handler: ((e: MouseEvent) => void) | null = null;

  constructor(
    private eventBus: EventBus,
    maxClicks: number
  ) {
    this.clicks = new RingBuffer<ClickEntry>(maxClicks);
  }

  setup(): void {
    this.handler = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const entry: ClickEntry = {
        timestamp: new Date().toISOString(),
        selector: generateSelector(target),
        tagName: target.tagName.toLowerCase(),
        text: (target.textContent || '').trim().slice(0, 100),
        position: { x: event.clientX, y: event.clientY },
      };

      this.clicks.push(entry);

      this.eventBus.emit('click:captured', entry);
      this.eventBus.emit('breadcrumb:added', {
        category: 'click',
        message: `Clicked ${entry.tagName} "${entry.text}"`,
        data: { selector: entry.selector },
      });
    };

    document.addEventListener('click', this.handler, true);
  }

  getClickTrail(): ClickEntry[] {
    return this.clicks.toArray();
  }

  teardown(): void {
    if (this.handler) {
      document.removeEventListener('click', this.handler, true);
      this.handler = null;
    }
    this.clicks.clear();
  }
}
