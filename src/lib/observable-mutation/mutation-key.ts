export type MutationKey<TInput>
  = | string
    | [unknown, ...unknown[]]
    | ((input: TInput | undefined) => [unknown, ...unknown[]]);

export function getMutationKey<TInput>(
  keyOrFactory: MutationKey<TInput> | undefined,
  input: TInput | undefined,
): undefined | [unknown, ...unknown[]] {
  if (!keyOrFactory) {
    return undefined;
  }

  if (typeof keyOrFactory === 'string') {
    return [keyOrFactory];
  }

  if (Array.isArray(keyOrFactory)) {
    return keyOrFactory;
  }

  if (typeof keyOrFactory === 'function') {
    return keyOrFactory(input);
  }

  return undefined;
}
