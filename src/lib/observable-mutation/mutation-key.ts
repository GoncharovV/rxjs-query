export type MutationKey<TInput>
  = | string
    | [unknown, ...unknown[]]
    | ((input: TInput | undefined) => [unknown, ...unknown[]]);

export function getMutationKey<TInput>(keyOrFactory: MutationKey<TInput>, input: TInput | undefined): [unknown, ...unknown[]] {
  if (typeof keyOrFactory === 'string') {
    return [keyOrFactory];
  }

  if (Array.isArray(keyOrFactory)) {
    return keyOrFactory;
  }

  if (typeof keyOrFactory === 'function') {
    return keyOrFactory(input);
  }

  return [''];
}
