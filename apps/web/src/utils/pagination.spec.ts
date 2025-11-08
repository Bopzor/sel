import { describe, it, expect } from 'vitest';

import { pagination } from './pagination';

describe('pagination', () => {
  it('displays all pages when they are less or equal to max display', () => {
    expect(pagination({ pages: 5, current: 1 })).toEqual([1, 2, 3, 4, 5]);
    expect(pagination({ pages: 7, current: 1 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('displays page ellipsis around current page if higher than max display', () => {
    expect(pagination({ pages: 100, current: 42 })).toEqual([1, '...', 41, 42, 43, '...', 100]);
    expect(pagination({ pages: 9, current: 5 })).toEqual([1, '...', 4, 5, 6, '...', 9]);
    expect(pagination({ pages: 10, current: 5 })).toEqual([1, '...', 4, 5, 6, '...', 10]);
    expect(pagination({ pages: 20, current: 10 })).toEqual([1, '...', 9, 10, 11, '...', 20]);
  });

  it('displays one page ellipsis at the end if number of page if higher than max display and current is start', () => {
    expect(pagination({ pages: 9, current: 1 })).toEqual([1, 2, 3, 4, 5, '...', 9]);
    expect(pagination({ pages: 9, current: 4 })).toEqual([1, 2, 3, 4, 5, '...', 9]);
    expect(pagination({ pages: 10, current: 2 })).toEqual([1, 2, 3, 4, 5, '...', 10]);
  });

  it('displays page ellipsis at the start if number of page if higher than max display and current is end', () => {
    expect(pagination({ pages: 9, current: 8 })).toEqual([1, '...', 5, 6, 7, 8, 9]);
    expect(pagination({ pages: 9, current: 6 })).toEqual([1, '...', 5, 6, 7, 8, 9]);
    expect(pagination({ pages: 10, current: 8 })).toEqual([1, '...', 6, 7, 8, 9, 10]);
  });
});
