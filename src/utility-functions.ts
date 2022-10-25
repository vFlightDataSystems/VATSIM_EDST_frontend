export const unsafeEntries = Object.entries as <T, K extends string>(o: Record<K, T>) => [K, T][];
export const isEnum = <T extends Record<string, string>>(enumObj: T) => (s: string): s is T[keyof T] => Object.values(enumObj).includes(s);
export function assert(value: unknown, message: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}
