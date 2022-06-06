import dedup, { cache } from "./index";

it("works", () => {
  async function doStuff() {
    counter++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 42;
  }

  let counter = 0;

  doStuff();
  doStuff();
  doStuff();
  expect(counter).toBe(3);
  expect(cache.size).toBe(0);

  counter = 0;

  dedup(doStuff, ["a"]);
  dedup(doStuff, ["a"]);
  dedup(doStuff, ["a"]);
  expect(counter).toBe(1);
  expect(cache.size).toBe(1);

  counter = 0;

  dedup(doStuff, ["b"]);
  dedup(doStuff, ["c"]);
  dedup(doStuff, ["b"]);
  expect(counter).toBe(2);
  expect(cache.size).toBe(3);
});
