import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus';
import { ClickCollector } from '../../src/collectors/click-collector';

describe('ClickCollector', () => {
  let eventBus: EventBus;
  let collector: ClickCollector;

  beforeEach(() => {
    eventBus = new EventBus();
    collector = new ClickCollector(eventBus, 5);
    collector.setup();
  });

  afterEach(() => {
    collector.teardown();
  });

  it('captures click events', () => {
    const captured: unknown[] = [];
    eventBus.on('click:captured', (entry) => captured.push(entry));

    const btn = document.createElement('button');
    btn.textContent = 'Click me';
    document.body.appendChild(btn);

    btn.click();

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      tagName: 'button',
      text: 'Click me',
    });

    document.body.removeChild(btn);
  });

  it('maintains a click trail with max capacity', () => {
    const btn = document.createElement('button');
    btn.textContent = 'Test';
    document.body.appendChild(btn);

    for (let i = 0; i < 8; i++) {
      btn.click();
    }

    const trail = collector.getClickTrail();
    expect(trail).toHaveLength(5); // max capacity is 5

    document.body.removeChild(btn);
  });

  it('emits breadcrumb:added for each click', () => {
    const breadcrumbs: unknown[] = [];
    eventBus.on('breadcrumb:added', (bc) => breadcrumbs.push(bc));

    const div = document.createElement('div');
    div.textContent = 'Hello';
    document.body.appendChild(div);

    div.click();

    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toMatchObject({
      category: 'click',
    });

    document.body.removeChild(div);
  });

  it('truncates long text to 100 characters', () => {
    const captured: any[] = [];
    eventBus.on('click:captured', (entry) => captured.push(entry));

    const p = document.createElement('p');
    p.textContent = 'x'.repeat(200);
    document.body.appendChild(p);

    p.click();

    expect(captured[0].text.length).toBe(100);

    document.body.removeChild(p);
  });

  it('clears click trail on teardown', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.click();

    expect(collector.getClickTrail().length).toBeGreaterThan(0);

    collector.teardown();
    expect(collector.getClickTrail()).toHaveLength(0);

    document.body.removeChild(btn);
  });
});
