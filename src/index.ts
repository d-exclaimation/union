//
//  index.ts
//  union
//
//  Created by d-exclaimation on 05 Dec 2022
//

/**
 * A signature that allow type to be uniquely identified
 *
 * @template K The key type to identify the signature
 */
export type Signature<K> = { readonly __type: K };

/**
 * Merge two types with the later being more important,
 * i.e. second type override all its intersection with the first
 *
 * @template First The first type (must be an object)
 * @template Second The second type (must be an object)
 * @template Intersection The combined type with no priority (must be an intersection of A and B)
 */
export type Merge<
  First extends Record<string, unknown>,
  Second extends Record<string, unknown>,
  Intersection extends First & Second = First & Second
> = {
  [K in keyof Intersection]: K extends keyof Second
    ? Second[K]
    : Intersection[K];
};

/**
 * Union types from a definition of a key and payload object that can be uniquely identified with a signature
 *
 * @template Def The key and payload definition object
 */
export type Union<Def extends Record<string, Record<string, unknown>>> = {
  [Key in keyof Def]: Merge<Def[Key], Signature<Key>>;
}[keyof Def];

/**
 * Narrow down a union type with a unique signature key
 *
 * @template Unity The union type that contains a signature
 * @template Key The signature to narrow down the type
 */
export type Narrow<
  Unity extends Signature<string>,
  Key extends Unity["__type"]
> = Unity extends Signature<Key> ? Unity : never;

/**
 * Object containing key and function pairs for all possible types in a union based on their signature
 *
 * @template Unity The union type that contains a signature
 * @template Out The return type of all functions
 */
export type Matches<Unity extends Signature<string>, Out = void> = {
  [Key in Unity["__type"]]: (input: Narrow<Unity, Key>) => Out;
};

/**
 * Matches that allow default case while still being exhausive
 *
 * - Allow the use `*` to match all unmatched pattern similar to a switch's default
 * - Still enforce all patterns unless `*` is specified, where these patterns become optional
 *
 * @template Unity The union type that contains a signature
 * @template Out The return type of all functions
 */
export type ExhausiveMatches<Unity extends Signature<string>, Out = void> =
  | ({ "*": (input: Unity) => Out } & Partial<Matches<Unity, Out>>)
  | Matches<Unity, Out>;

/**
 * Pattern match a union with a identifiable type signature
 * @param input The input with the union type to be matched against
 * @param matchers Matchers would be run if having matching key signature
 * @returns The output / return type of all the matcher functions
 */
export function match<In extends Signature<string>, Out = void>(
  input: In,
  matchers: ExhausiveMatches<In, Out>
): Out {
  for (const [key, handler] of Object.entries(matchers)) {
    if (input.__type === key) {
      return (handler as (input: In) => Out)(input);
    }
  }

  if ("*" in matchers) {
    return matchers["*"](input);
  }

  throw new Error("Pattern unmacthed");
}

/**
 * Pattern match a union with a identifiable type signature (High order function)
 *
 * @param matchers Matchers would be run if having matching key signature
 * @returns The output / return type of all the matcher functions
 */
export function matches<In extends Signature<string>, Out = void>(
  matchers: ExhausiveMatches<In, Out>
): (input: In) => Out {
  return (input) => match(input, matchers);
}
