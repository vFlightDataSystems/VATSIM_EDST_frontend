export const unsafeKeys = Object.keys as <T>(o: T) => (keyof T)[];
export function strIsEnum<T extends string>(str: string, enumObj: Record<T, string>): str is T {
  return Object.keys(enumObj).includes(str);
}
