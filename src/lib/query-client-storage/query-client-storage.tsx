import { QueryClient } from '@tanstack/query-core';

import { __DEV__ } from '../__dev__';


let queryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient();

    if (__DEV__) {
      console.warn('No query client set. Using default query client. Better call `setQueryClient` yourself.');
    }
  }

  return queryClient;
}
