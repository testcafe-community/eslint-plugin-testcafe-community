# `no-disabled-tests`

_Prevent tests from being disabled and forgotten._

## Rule Details

This rule aims to prevent `fixture.skip()` or `test.skip()` from being added to
source control. It is fine to use this locally in development to help isolate
testcases for iterative development, but it is not recommended to have disabled
tests permenantly in the codebase.

The `/recommended` ruleset sets this control to a warning state.

Examples of **incorrect** code for this rule:

```js
// 1. Fixture and associated tests disabled
fixture.skip("foo");
test("skipped due to fixture", async (t) => {
    await t.expect(Selector("foo").exists).ok();
});

// 2. Fixture skip syntax variation
fixture.skip`foo`;

// 3. Individual skipped test
fixture("MyApp").page("https://example.com");
test.skip("skipped test", async (t) => {
    await t.expect(Selector("foo").exists).ok();
});
```

Examples of **correct** code for this rule:

```js
// EXAMPLE 1
fixture("foo");
test("bar", async (t) => {
    await t.expect(Selector("foo").exists).ok();
});

// EXAMPLE 2
fixture`foo2`;
test("foobar", async (t) => {
    await t.expect(Selector("foo").exists).ok();
});
```

## When Not To Use It

Rarely never. Formal test patterns recommend `skip` should only be used for test
isolation during debugging so rapid iteration can occur. If you choose to use an
anti-pattern, then you might need to disable this rule.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/organize-tests.html#skip-tests>
