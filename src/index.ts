import stringify from "fast-json-stable-stringify";

export type Key = unknown[];
export type Stale = "never" | "settled" | number;
export type Settings = { key: Key; stale: Stale };

export const cache = new Map<string, PromiseLike<any>>();

export default function dedup<P extends PromiseLike<any>>(
  exec: () => P,
  key: Key
): P;

export default function dedup<P extends PromiseLike<any>>(
  exec: () => P,
  settings: Settings
): P;

export default function dedup<P extends PromiseLike<any>>(
  exec: () => P,
  settings_: Key | Settings
): P {
  const settings: Settings = !Array.isArray(settings_)
    ? settings_
    : { key: settings_, stale: "settled" };

  const key = stringify(settings.key);

  const cached = cache.get(key);
  if (cached) return cached as P;

  let promise = exec();
  cache.set(key, promise);

  const clean = () => {
    cache.delete(key);
  };

  if (typeof settings.stale === "number") {
    setTimeout(clean, settings.stale);
  } else if (settings.stale === "settled") {
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
