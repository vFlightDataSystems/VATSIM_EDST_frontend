export type Nullable<T> = T | null;
export type AllOrNone<T> = T | { [K in keyof T]?: never };
export type ExactlyOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & { [L in keyof Omit<T, K>]?: never };
}[keyof T];
export type AtMostOne<T> = Partial<ExactlyOne<T>>;
