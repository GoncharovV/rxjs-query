import { Observable, of } from 'rxjs';
import {
  MutationObserver,
  MutationObserverResult,
  MutationOptions,
  NetworkMode,
  QueryClient,
} from '@tanstack/query-core';

import { getQueryClient } from '../query-client-storage';
import { getMutationKey, MutationKey } from './mutation-key';


type DefaultError = Error;


export interface ObservableMutationOptions<TInput = void, TOutput = unknown> {
  mutationKey: MutationKey<TInput>;
  mutationFn: (input: TInput) => Promise<TOutput>;

  queryClient?: QueryClient;

  networkMode?: NetworkMode;
  gcTime?: number;

  throwOnError?: boolean | ((error: DefaultError) => boolean);
}

export class ObservableMutation<TInput = void, TOutput = unknown> {

  protected readonly mutationObserver: MutationObserver<TOutput, DefaultError, TInput>;

  private executedMutationResult$: Observable<MutationObserverResult<TOutput, DefaultError, TInput>> | undefined = undefined;

  private get optimisticMutationResult$(): Observable<MutationObserverResult<TOutput, DefaultError, TInput>> {
    return of(
      this.getCurrentResult(),
    );
  }

  public get mutation$(): Observable<MutationObserverResult<TOutput, DefaultError, TInput>> {
    if (this.executedMutationResult$) {
      return this.executedMutationResult$;
    }

    return this.optimisticMutationResult$;
  }

  protected get queryClient() {
    return this.options?.queryClient ?? getQueryClient();
  }

  constructor(
    private readonly options: ObservableMutationOptions<TInput, TOutput>,
  ) {
    this.mutationObserver = new MutationObserver<TOutput, DefaultError, TInput>(
      this.queryClient,
      this.getDefaultMutationOptions(),
    );
  }

  public fetchMutation(input: TInput) {
    this.mutationObserver.setOptions({
      ...this.options,
      mutationKey: getMutationKey(this.options.mutationKey, input),
      mutationFn: () => this.options.mutationFn(input),
    });

    this.executedMutationResult$ = new Observable<MutationObserverResult<TOutput, DefaultError, TInput>>((observer) => {
      const unsubscribe = this.mutationObserver.subscribe((result) => {
        observer.next(result);
      });

      return () => {
        unsubscribe();
      };
    });

    this.mutationObserver.mutate(input);

    return this.executedMutationResult$;
  }

  public getCurrentResult(): MutationObserverResult<TOutput, DefaultError, TInput> {
    return this.mutationObserver.getCurrentResult();
  }

  private getDefaultMutationOptions(): MutationOptions<TOutput, DefaultError, TInput> {
    return this.queryClient.defaultMutationOptions();
  }

}
