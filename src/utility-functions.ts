export const unsafeKeys = Object.keys as <T>(o: T) => (keyof T)[];
export const unsafeEntries = Object.entries as <T, K extends string>(o: Record<K, T>) => [K, T][];
export const isEnum = <T extends Record<string, string>>(enumObj: T) => (s: string): s is T[keyof T] => Object.values(enumObj).includes(s);
