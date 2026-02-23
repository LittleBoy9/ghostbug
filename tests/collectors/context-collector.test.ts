import { describe, it, expect } from 'vitest';
import { ContextCollector } from '../../src/collectors/context-collector';

describe('ContextCollector', () => {
  it('takes a snapshot of the page context', () => {
    const collector = new ContextCollector();
    const ctx = collector.snapshot();

    expect(ctx).toHaveProperty('url');
    expect(ctx).toHaveProperty('userAgent');
    expect(ctx).toHaveProperty('language');
    expect(ctx).toHaveProperty('viewport');
    expect(ctx.viewport).toHaveProperty('width');
    expect(ctx.viewport).toHaveProperty('height');
    expect(ctx).toHaveProperty('screen');
    expect(ctx).toHaveProperty('devicePixelRatio');
    expect(ctx).toHaveProperty('timestamp');
  });

  it('setup and teardown are no-ops', () => {
    const collector = new ContextCollector();
    expect(() => collector.setup()).not.toThrow();
    expect(() => collector.teardown()).not.toThrow();
  });
});
