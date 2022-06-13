# promise-dedup

Deduplicate any promise.

## Cache promises by key

By default, `dedup` caches promises until they are settled:

```ts
import { dedup } from "promise-dedup";

async function doStuff() {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Waiting five seconds
  return 5;
}

dedup(doStuff, ["key", 42]);
dedup(doStuff, ["key", 42]);
dedup(doStuff, ["key", 42]);

// doStuff is only called once at this point

await new Promise((resolve) => setTimeout(resolve, 6000)); // Waiting six seconds

dedup(doStuff, ["key", 42]); // doStuff is called again because the previous promise settled
```

The third optional argument of `dedup` is the stale policy. By default, it's `"settled"`.
It can be set to `"never"` or to a number. When set to `"never"`, the promise never gets stale.
When set to a number, the promise gets stale after a timeout of that number as milliseconds.
