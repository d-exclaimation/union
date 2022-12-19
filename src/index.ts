//
//  index.ts
//  union
//
//  Created by d-exclaimation on 05 Dec 2022
//

/**
 * Non-nullable plain object type
 *
 * @template V The type of all the values
 */
export type Obj<V = unknown> = Record<string, V>;

/**
 * A signature that allow type to be uniquely identified
 *
 * @template K The key type to identify the signature
 */
export type Signature<K> = { readonly __type: K };

/**
 * Union types from a definition of a key and payload object that can be uniquely identified with a signature
 *
 * @template Def The key and payload definition object
 */
export type Union<Def extends Obj<Obj>> = {
  [Key in keyof Def]: Def[Key] & Signature<Key>;
}[keyof Def];

/**
 * Narrow down a union type with a unique signature key
 *
 * **Limitation**: Narrow functionality is limited when generic is nested within the Unity and Key
 *
 * @template Unity The union type that contains a signature
 * @template Key The signature to narrow down the type
 */
export type Narrow<
  Unity extends Signature<string>,
  Key extends Unity["__type"]
> = Unity extends Signature<Key> ? Unity : never;

/**
 * Narrow down a union type with a unique signature key, omitting the signature
 *
 * **Limitation**: Narrow functionality is limited when generic is nested within the Unity and Key
 *
 * @template Unity The union type that contains a signature
 * @template Key The signature to narrow down the type
 */
export type NoSignatureNarrow<
  Unity extends Signature<string>,
  Key extends Unity["__type"]
> = Omit<Narrow<Unity, Key>, "__type">;

/**
 * Case for UnionCases
 *
 * @template Key A key for the case
 * @template Payload An optional payload
 */
export type Case<Key extends string, Payload extends Obj = {}> = [Key, Payload];

/**
 * Union types from a list of Case that can be uniquely identified with a signature
 *
 * @template Cases A list of Case for the union
 */
export type UnionCases<
  Cases extends Array<Case<string, Obj>>,
  Def extends Obj<Obj> = {}
> = Cases extends [Case<infer K, infer P>, ...infer Next]
  ? UnionCases<
      Next extends Array<Case<string, Obj>> ? Next : [],
      Def & { [Key in K]: P }
    >
  : Union<Def>;

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
