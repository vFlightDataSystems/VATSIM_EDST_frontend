export type Nullable<T> = T | null;
export type AllOrNone<T> = T | { [K in keyof T]?: never };
