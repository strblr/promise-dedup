import { cache, dedup } from "./index";

it("works", async () => {
  async function doStuff() {
    counter++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 42;
  }

  let counter = 0;

  // Without dedup
  doStuff();
  doStuff();
  doStuff();
  expect(counter).toBe(3);
  expect(cache.size).toBe(0);

  counter = 0;

  // Before settled
  dedup(doStuff, ["a"]);
  dedup(doStuff, ["a"]);
  dedup(doStuff, ["a"]);
  expect(counter).toBe(1);
  expect(cache.size).toBe(1);

  counter = 0;

  // Should dedup the right keys
  dedup(doStuff, ["b"]);
  dedup(doStuff, ["c"]);
  dedup(doStuff, ["b"]);
  expect(counter).toBe(2);
  expect(cache.size).toBe(3);

  counter = 0;

  // After settled
  await dedup(doStuff, ["d"]);
  await dedup(doStuff, ["d"]);
  dedup(doStuff, ["d"]);
  expect(counter).toBe(3);

  counter = 0;

  // Never stale
  await dedup(doStuff, ["e"], "never");
  await dedup(doStuff, ["e"]);
  dedup(doStuff, ["e"]);
  expect(counter).toBe(1);

  counter = 0;

  // After timeout
  dedup(doStuff, ["f"], 500);
  dedup(doStuff, ["f"]);
  dedup(doStuff, ["f"]);
  expect(counter).toBe(1);
  await new Promise((resolve) => setTimeout(resolve, 600));
  dedup(doStuff, ["f"]);
  expect(counter).toBe(2);
});
