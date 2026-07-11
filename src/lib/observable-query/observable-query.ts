import { filter, map, Observable, of } from 'rxjs';
import {
  DefaultedQueryObserverOptions,
  NotifyOnChangeProps,
  PlaceholderDataFunction,
  Query,
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverOptions,
  QueryObserverResult,
  QueryOptions,
  StaleTimeFunction,
  ThrowOnError,
} from '@tanstack/query-core';

import { getQueryClient } from '../query-client-storage';
import { getQueryKey, QueryKeyOrFactory } from './query-key';
import { NonFunctionGuard } from './types';


type DefaultError = Error;


export interface ObservableQueryOptions<
  TOutput = unknown,
  TInput = void,
  TDerivedData = TOutput,
> extends Omit<QueryOptions<TOutput, DefaultError, TDerivedData>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKeyOrFactory<TInput>;
  queryFn: (input: TInput) => Promise<TOutput> | TOutput;

  queryClient?: QueryClient;

  // Props from QueryObserverOptions
  notifyOnChangeProps?: NotifyOnChangeProps;
  select?: (data: TOutput) => TDerivedData;
  staleTime?: StaleTimeFunction<TOutput, DefaultError, TDerivedData>;
  refetchInterval?: number | false | ((query: Query<TOutput, DefaultError, TDerivedData>) => number | false | undefined);
  refetchIntervalInBackground?: boolean;
  throwOnError?: ThrowOnError<TOutput, DefaultError, TDerivedData, QueryKey>;
  placeholderData?:
    | NonFunctionGuard<TOutput>
    | PlaceholderDataFunction<NonFunctionGuard<TOutput>, DefaultError, NonFunctionGuard<TOutput>>;
}

export class ObservableQuery<
  TOutput = unknown,
  TInput = TOutput,
  TDeridedData = TOutput,
> {

  protected readonly queryObserver: QueryObserver<TOutput, DefaultError, TDeridedData>;

  protected get queryClient() {
    return this.options?.queryClient ?? getQueryClient();
  }

  private executedQueryResult$: Observable<QueryObserverResult<TDeridedData>> | undefined = undefined;

  private get optimisticQueryResult$(): Observable<QueryObserverResult<TDeridedData>> {
    return of(
      this.getOptimisticResult(),
    );
  }

  public get query$(): Observable<QueryObserverResult<TDeridedData>> {
    if (this.executedQueryResult$) {
      return this.executedQueryResult$;
    }

    return this.optimisticQueryResult$;
  }

  public get data$(): Observable<TDeridedData> {
    return this.query$.pipe(
      map((result) => result.data),
      filter((data) => data !== undefined),
    );
  }

  public get isLoading$(): Observable<boolean> {
    return this.query$.pipe(
      map((result) => result.isLoading),
    );
  }

  public get isPending$(): Observable<boolean> {
    return this.query$.pipe(
      map((result) => result.isPending),
    );
  }

  public get isFetching$(): Observable<boolean> {
    return this.query$.pipe(
      map((result) => result.isFetching),
    );
  }

  constructor(
    private readonly options: ObservableQueryOptions<TOutput, TInput, TDeridedData>,
  ) {
    this.queryObserver = new QueryObserver<TOutput, DefaultError, TDeridedData>(
      this.queryClient,
      this.getDefaultQueryOptions(),
    );
  }

  public fetchQuery(
    ...args: TInput extends undefined | void
    // It is possible to add runtime options here
      ? [input?: undefined]
      : [input: TInput]
  ): Observable<QueryObserverResult<TDeridedData>> {
    const [input] = args as [TInput];

    this.queryObserver.setOptions({
      ...this.options,
      queryKey: getQueryKey(this.options.queryKey, input),
      queryFn: () => this.options.queryFn(input),
    } as QueryObserverOptions<TOutput, DefaultError, TDeridedData>);

    this.executedQueryResult$ = new Observable<QueryObserverResult<TDeridedData>>((observer) => {
      const unsubscribe = this.queryObserver.subscribe((result) => {
        observer.next(result);
      });

      return () => {
        unsubscribe();
      };
    });

    return this.executedQueryResult$;
  }

  public getOptimisticResult(): QueryObserverResult<TDeridedData> {
    const defaultQueryOptions = this.getDefaultQueryOptions();

    return this.queryObserver.getOptimisticResult(defaultQueryOptions);
  }

  private getDefaultQueryOptions(): DefaultedQueryObserverOptions<TOutput, DefaultError, TDeridedData> {
    return this.queryClient.defaultQueryOptions<TOutput, DefaultError, TDeridedData>({
      ...this.options,
      queryKey: getQueryKey(this.options.queryKey, undefined),
    } as DefaultedQueryObserverOptions<TOutput, DefaultError, TDeridedData>);
  }

  public destroy() {
    this.queryObserver.destroy();
  }

}
