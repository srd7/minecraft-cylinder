export function range(start: number, end: number): number[] {
  if (start > end) {
    return range(end, start);
  }
  const s = Math.floor(start);
  const e = Math.ceil(end);
  const result = [];
  for (let i = s; i <= e; i++) {
    result.push(i);
  }
  return result;
}
