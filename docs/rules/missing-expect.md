# `missing-expect`

_All tests should have at least one assertion._

## Rule Details

This rule aims to ensure a `t.expect()` function call exists within a defined
test block. There maybe times in local development you don't have an assertion
defined, but this rule aims to prevent a test case from being accidentally
committed and falsfully report a test success when it doesn't evaluate any
condition.

Examples of **incorrect** code for this rule:

```js
// Example 1: Forgot to add an assertion but provided an action
test("should do stuff", async (t) => {
    await t.click(Selector("foo"));
});

// Example 2: empty test scaffolding
test("test something", (t) => {
    // TODO: Test something
});
```

Examples of **correct** code for this rule:

```js
test("should change text to clicked", async (t) => {
    const { text } = Selector("bar");
    await t.click(Selector("foo"));
    await t.expect(text).toEqual("button clicked"); // Makes an assertion
});
```

## When Not To Use It

Rarely never. If you desire to have empty test cases in the codebase, then you
may disable this rule but that is definitely not a common anti-pattern. Highly
suggest commenting out unimplemented or empty tests instead.

If you override the `t: TestController` object or its wrap its method, then you
likely will need to disable this rule.

## Further Reading

<https://testcafe.io/documentation/402837/guides/basic-guides/assert>
