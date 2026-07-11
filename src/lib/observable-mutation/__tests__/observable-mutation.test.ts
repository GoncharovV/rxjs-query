import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { QueryClient } from '@tanstack/query-core';

import { setQueryClient } from '../../query-client-storage';
import { ObservableMutation } from '../observable-mutation';


describe('Observable Mutation', () => {
  beforeEach(() => {
    setQueryClient(new QueryClient());
  });

  test('mutationFn should not be called until fetchMutation is called', () => {
    const mutationFn = vi.fn();

    const mutation = new ObservableMutation({ mutationFn });

    const subscription = new Subscription();

    subscription.add(mutation.mutation$.subscribe());
    subscription.add(mutation.isPending$.subscribe());
    subscription.add(mutation.succeed$.subscribe());
    subscription.add(mutation.failed$.subscribe());

    subscription.unsubscribe();

    expect(mutationFn).not.toHaveBeenCalled();
  });

  test('queryFn called with input on fetchMutation', async () => {
    const mutationFn = vi.fn((_: { input: string; }) => Promise.resolve({}));

    const query = new ObservableMutation({ mutationFn });

    await firstValueFrom(query.fetchMutation({ input: 'test' }));

    expect(mutationFn).toHaveBeenCalledWith({ input: 'test' });
  });

  test('fetchMutation returns observable with queryFn data', async () => {
    const mutationFn = vi.fn(async (_: { input: string; }) => Promise.resolve({ data: true }));
    const onDataChanged = vi.fn();

    const mutation$ = new ObservableMutation({ mutationFn }).fetchMutation({ input: 'test' });

    mutation$.subscribe(onDataChanged);

    await lastValueFrom(mutation$);

    expect(onDataChanged).toHaveBeenCalledTimes(1);
    expect(onDataChanged).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: { data: true } }));
  });
});
