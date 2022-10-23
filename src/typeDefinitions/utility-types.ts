export type Nullable<T> = T | null;
export type AllOrNone<T> = T | { [K in keyof T]?: never };
export type AtMostOne<T> = { [K in keyof T]: Partial<Pick<T, K>> & { [L in keyof Omit<T, K>]?: never } }[keyof T];
