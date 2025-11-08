export function pagination({ pages, current }: { pages: number; current: number }): (number | '...')[] {
  const MAX_DISPLAYED = 7;
  const range = (start: number, end: number) =>
    Array.from({ length: end + 1 - start }).map((_, index) => start + index);

  if (pages <= MAX_DISPLAYED) {
    return range(1, pages);
  }

  const ellipsis = '...' as const;

  const nearStart = current < MAX_DISPLAYED - 2;
  const nearEnd = current > pages - 4;

  if (nearStart) {
    return [...range(1, MAX_DISPLAYED - 2), ellipsis, pages];
  }

  if (nearEnd) {
    return [1, ellipsis, ...range(pages - 4, pages)];
  }

  return [1, ellipsis, ...range(current - 1, current + 1), ellipsis, pages];
}
