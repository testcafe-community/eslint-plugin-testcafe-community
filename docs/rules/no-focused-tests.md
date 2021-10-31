# `no-focused-tests`

_Don't allow a single test or fixture to take all the focus._

## Rule Details

This rule aims to prevent `test.only()` or `fixture.only()` from being left in
the codebase. It's fine to use this locally for development, but this rule aims
to prevent it from getting accidentally committed. You don't want to have a CI
pipeline pass successfully when the code is actually broken but none of the
important tests were executed because of an `.only` directive.

Examples of **incorrect** code for this rule:

```js
// 1. As Method call
test.only("foo", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});

// 2. Chained as modifier
test.only.page("http://example.com")("foo", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});

// 3. Only allows single fixture and its tests
fixture.only("MyApp");
test("test1", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});

// 4. Fixture Variation
fixture.only`MyApp2`;
test("test1", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});
```

Examples of **correct** code for this rule:

```js
fixture("MyApp");
test("test1", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});

fixture`MyApp2`;
test.page("http://example.com")("foo", async (t) => {
    await t.expect(Selector("bar").exists).ok();
});
```

## When Not To Use It

Rarely never. Formal test patterns recommend it is only for test isolation
during debugging so rapid iteration can occur. If you use an anti-pattern, where
you use `only` to forcefully enable tests, then disable this rule.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/organize-tests.html#only-tests>
