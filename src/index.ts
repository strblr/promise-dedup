import stringify from "fast-json-stable-stringify";

export type Key = unknown[];
export type Stale = "never" | "settled" | number;

export const cache = new Map<string, PromiseLike<any>>();

export default function dedup<P extends PromiseLike<any>>(
  exec: () => P,
  key: Key,
  stale: Stale = "settled"
): P {
  const strKey = stringify(key);

  const cached = cache.get(strKey);
  if (cached) return cached as P;

  let promise = exec();
  cache.set(strKey, promise);

  const clean = () => {
    cache.delete(strKey);
  };

  if (typeof stale === "number") {
    setTimeout(clean, stale);
  } else if (stale === "settled") {
    promise = promise.then(
      (value) => {
        clean();
        return value;
      },
      (error) => {
        clean();
        throw error;
      }
    ) as P;
  }

  return promise;
}
