// get real type of objects JS is shit, bro. I told you i must have written it in rust!
export function getType(value: unknown): string {
  return {}.toString.call(value).split(' ')[1].slice(0, -1).toLowerCase();
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
