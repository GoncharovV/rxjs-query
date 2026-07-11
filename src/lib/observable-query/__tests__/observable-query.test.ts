import { firstValueFrom, lastValueFrom, Subscription, takeWhile } from 'rxjs';
import { QueryClient } from '@tanstack/query-core';

import { setQueryClient } from '../../query-client-storage';
import { ObservableQuery } from '../observable-query';


const queryKey = '-';

describe('Observable Query', () => {
  beforeEach(() => {
    setQueryClient(new QueryClient());
  });

  test('queryFn should not be called until fetchQuery is called', () => {
    const queryFn = vi.fn();

    const query = new ObservableQuery({ queryKey, queryFn });

    const subscription = new Subscription();

    subscription.add(query.query$.subscribe());
    subscription.add(query.data$.subscribe());
    subscription.add(query.isLoading$.subscribe());

    subscription.unsubscribe();

    expect(queryFn).not.toHaveBeenCalled();
  });

  test('queryFn called with input on fetchQuery', async () => {
    const queryFn = vi.fn((_: { input: string; }) => ({}));

    const query = new ObservableQuery({ queryKey, queryFn });

    await firstValueFrom(query.fetchQuery({ input: 'test' }));

    expect(queryFn).toHaveBeenCalledWith({ input: 'test' });
  });

  test('fetchQuery returns observable with queryFn data', async () => {
    const queryFn = vi.fn(async (_: { input: string; }) => Promise.resolve({ data: true }));
    const onDataChanged = vi.fn();

    const query$ = new ObservableQuery({ queryKey, queryFn }).fetchQuery({ input: 'test' }).pipe(
      takeWhile((result) => result.isLoading, true),
    );

    query$.subscribe(onDataChanged);

    await lastValueFrom(query$);

    expect(onDataChanged).toHaveBeenCalledTimes(2);
    expect(onDataChanged).toHaveBeenNthCalledWith(1, expect.objectContaining({ isLoading: true, data: undefined }));
    expect(onDataChanged).toHaveBeenNthCalledWith(2, expect.objectContaining({ isLoading: false, data: { data: true } }));
  });


  test('observerOptions -> select', async () => {
    const queryFn = vi.fn(async (_: { input: string; }) => Promise.resolve({ result: 'nested' }));
    const onDataChanged = vi.fn();


    const query$ = new ObservableQuery({
      queryKey,
      queryFn,
      select: (data) => data.result,
    }).fetchQuery({ input: 'test' }).pipe(
      takeWhile((result) => result.isLoading, true),
    );

    query$.subscribe(onDataChanged);

    await lastValueFrom(query$);

    expect(onDataChanged).toHaveBeenLastCalledWith(expect.objectContaining({ data: 'nested' }));
  });
});
