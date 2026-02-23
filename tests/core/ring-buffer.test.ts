import { describe, it, expect, beforeEach } from 'vitest';
import { RingBuffer } from '../../src/core/ring-buffer';

describe('RingBuffer', () => {
  let buffer: RingBuffer<number>;

  beforeEach(() => {
    buffer = new RingBuffer<number>(3);
  });

  it('starts empty', () => {
    expect(buffer.size).toBe(0);
    expect(buffer.isFull).toBe(false);
    expect(buffer.toArray()).toEqual([]);
  });

  it('pushes items and returns them in order', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);

    expect(buffer.size).toBe(3);
    expect(buffer.isFull).toBe(true);
    expect(buffer.toArray()).toEqual([1, 2, 3]);
  });

  it('overwrites oldest item when full', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    buffer.push(4);

    expect(buffer.size).toBe(3);
    expect(buffer.toArray()).toEqual([2, 3, 4]);
  });

  it('overwrites multiple items correctly', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    buffer.push(4);
    buffer.push(5);

    expect(buffer.toArray()).toEqual([3, 4, 5]);
  });

  it('peek returns most recently pushed item', () => {
    expect(buffer.peek()).toBeUndefined();

    buffer.push(1);
    expect(buffer.peek()).toBe(1);

    buffer.push(2);
    expect(buffer.peek()).toBe(2);
  });

  it('find locates items by predicate', () => {
    buffer.push(10);
    buffer.push(20);
    buffer.push(30);

    expect(buffer.find((x) => x === 20)).toBe(20);
    expect(buffer.find((x) => x === 99)).toBeUndefined();
  });

  it('forEach iterates all items', () => {
    buffer.push(1);
    buffer.push(2);
    const collected: number[] = [];
    buffer.forEach((x) => collected.push(x));
    expect(collected).toEqual([1, 2]);
  });

  it('clear resets the buffer', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.clear();

    expect(buffer.size).toBe(0);
    expect(buffer.toArray()).toEqual([]);
    expect(buffer.peek()).toBeUndefined();
  });

  it('works with capacity of 1', () => {
    const tiny = new RingBuffer<string>(1);
    tiny.push('a');
    expect(tiny.toArray()).toEqual(['a']);

    tiny.push('b');
    expect(tiny.toArray()).toEqual(['b']);
    expect(tiny.size).toBe(1);
  });
});
