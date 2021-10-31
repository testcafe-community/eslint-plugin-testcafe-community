# `no-debug`

_Don't use `t.debug()` permanently in tests._

## Rule Details

This rule aims to prevent `t.debug()` from being added to source control. It's
fine to use this locally in development, but this rule aims to prevent it from
getting accidentally committed.

Examples of **incorrect** code for this rule:

```js
// EXAMPLE 1
test("should do stuff", async (t) => {
    await t.debug();
});

// EXAMPLE 2
fixture`foo`.beforeEach(async (t) => {
    await t.click(Selector("foo")).debug();
});

// EXAMPLE 3
test("should do stuff", async (t) => {
    await t.click(Selector("foo"));
    // Don't use debug output to match a snapshot!
    await t.expect(t.debug()).toEqual("<p>Hello World!</p>");
});
```

Examples of **correct** code for this rule:

```js
// EXAMPLE 1
fixture`foo`.beforeEach(async (t) => {
    await t.click(Selector("foo"));
});

// EXAMPLE 2
test("should do stuff", async (t) => {
    await t.expect(Selector("foo").exists).ok();
});
```

## When Not To Use It

If you would rather test verify specific html output or create long logs for
each test output.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/debug.html>
