# Don't allow test.skip to be added to the repository (no-skip)

## Rule Details

This rule aims to prevent `fixture.skip` or `test.skip` from being added to
source control, or perhaps as a warning.

Examples of **incorrect** code for this rule:

```js
fixture.skip`foo`;
fixture.skip("foo");
test.skip("foo", async (t) => {});
```

Examples of **correct** code for this rule:

```js
fixture`foo`;
fixture("foo");
test("foo", async (t) => {});
```

## When Not To Use It

If you don't care if people add skipped tests or fixtures to your source code
repository.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/organize-tests.html#skip-tests>
