import { QueryKey } from '@tanstack/query-core';


export type QueryKeyOrFactory<TQueryData> = string | [unknown, ...unknown[]] | ((input: TQueryData | undefined) => unknown[]);


export function getQueryKey<TInput>(queryKey: QueryKeyOrFactory<TInput>, input: TInput | undefined): QueryKey {
  if (typeof queryKey === 'string') {
    return [queryKey, input];
  }

  if (typeof queryKey === 'function') {
    return queryKey(input);
  }

  if (Array.isArray(queryKey)) {
    return [...queryKey, input];
  }

  return [queryKey, input];
}
