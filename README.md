# Union

Simple union and pattern matching for TypeScript

## Setup

### Install
```sh
npm i @d-exclaimation/union
```

### Import
```typescript
import { Union, match } from "@d-exclaimation/union";
```

## Guide

Instead of declaring union like so

```ts
interface Cat {
  breeds: "Abyssinian" | "Shorthair" | "Curl" | "Bengal"
}

interface Dog {
  breeds: "Hound" | "Brittany" | "Bulldog" | "Boxer"
  color: "brown" | "white" | "black"
}


type Animal = Cat | Dog;
```

You can just do

```ts
import type { Union } from "@d-excclaimation/union";

interface Cat {
  breeds: "Abyssinian" | "Shorthair" | "Curl" | "Bengal"
}

interface Dog {
  breeds: "Hound" | "Brittany" | "Bulldog" | "Boxer"
  color: "brown" | "white" | "black"
}

//    v { __type: "cat" } & Cat | { __type: "dog" } & Dog
type Animal = Union<{
  "cat": Cat,
  "dot": Dog
}>;
```

### Narrow down union type

You can narrow back to the concrete type like so

```ts
import type { Union, Narrow } from "@d-excclaimation/union";

type Result = Union<{
  "ok": { data: any, info: string },
  "err": { message: string, trace: string[] }
}>;

type Ok = Narrow<Result, "ok">
//   ^ { __type: "ok", data: any, info: string }
```

### Pattern matching against union

Union can be pattern match with the `match` function

```ts
import { Union, match } from "@d-excclaimation/union";

type WebSocketMessage = Union<{
  "text": { message: string },
  "binary": { length: number }
}>;

match<WebSocketMessage, void>({ __type: "text", message: "Hello!" }, {
  text: ({ message }) => console.log(message),
  binary: ({ length }) => console.log(`Got binary with length of ${length}`),
});

/// prints: Hello!

match<WebSocketMessage, void>({ __type: "binary", length: 10 }, {
  text: ({ message }) => console.log(message),
  binary: ({ length }) => console.log(`Got binary with length of ${length}`),
});

/// prints: Got binary with length of 10
```

You can also provide default case using `"*"`

```ts
match<WebSocketMessage | { __type: "unknown" }, void>({ __type: "binary", length: 10 }, {
  text: ({ message }) => console.log(message),
  binary: ({ length }) => console.log(`Got binary with length of ${length}`),
  "*": () => console.log("Got an unexpected message")
});

/// prints: Got an unexpected message
```

## Feedback
If you have any feedback, feel free reach out at twitter [@d_exclaimation](https://www.twitter.com/d_exclaimation) or email at [thisoneis4business@gmail.com](thisoneis4business@gmail.com).