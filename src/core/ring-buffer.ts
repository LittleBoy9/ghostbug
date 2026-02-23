export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private _size = 0;

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this._size < this.capacity) {
      this._size++;
    }
  }

  toArray(): T[] {
    if (this._size === 0) return [];

    const result: T[] = [];
    const start = this._size < this.capacity ? 0 : this.head;

    for (let i = 0; i < this._size; i++) {
      const idx = (start + i) % this.capacity;
      result.push(this.buffer[idx] as T);
    }

    return result;
  }

  get size(): number {
    return this._size;
  }

  get isFull(): boolean {
    return this._size === this.capacity;
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined;
    const idx = (this.head - 1 + this.capacity) % this.capacity;
    return this.buffer[idx];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    const arr = this.toArray();
    return arr.find(predicate);
  }

  forEach(fn: (item: T) => void): void {
    this.toArray().forEach(fn);
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this._size = 0;
  }
}
