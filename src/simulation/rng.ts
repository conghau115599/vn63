/** Keyed FNV-1a + avalanche; version 1. Streams never depend on call order. */
export function random(seed: string, namespace: string, key: string): number {
  let h = 2166136261;
  const input = `${seed}|${namespace}|${key}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
