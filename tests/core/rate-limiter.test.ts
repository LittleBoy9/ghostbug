import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../../src/core/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows events up to the limit', () => {
    const limiter = new RateLimiter(3, 1000);

    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(false);
  });

  it('allows events again after the window passes', () => {
    const limiter = new RateLimiter(2, 1000);

    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(limiter.allow()).toBe(true);
  });

  it('reset clears all timestamps', () => {
    const limiter = new RateLimiter(1, 1000);

    expect(limiter.allow()).toBe(true);
    expect(limiter.allow()).toBe(false);

    limiter.reset();
    expect(limiter.allow()).toBe(true);
  });
});
