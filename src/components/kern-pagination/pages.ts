/**
 * Page numbers to show, with `'…'` for gaps: always first and last, the current page and `siblings` on each side.
 * The number of slots stays the same while paging, so the buttons do not jump around.
 */
export function pageItems(current: number, count: number, siblings = 1): (number | '…')[] {
  const slots = 2 * siblings + 5; // first, last, current, siblings and two gaps
  if (count <= slots) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(current - siblings, count - 2 * siblings - 2));
  const end = Math.min(count - 1, Math.max(current + siblings, 2 * siblings + 3));
  const items: (number | '…')[] = [1];
  if (start > 2) items.push('…');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < count - 1) items.push('…');
  items.push(count);
  return items;
}
