export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxEvents: number,
    private windowMs: number
  ) {}

  allow(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxEvents) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  reset(): void {
    this.timestamps = [];
  }
}
