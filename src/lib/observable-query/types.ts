
export type NonFunctionGuard<T> = T extends Function ? never : T;
