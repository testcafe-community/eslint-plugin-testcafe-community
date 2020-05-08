# Don&#39;t allow test.only to be added to the repository (no-only)

## Rule Details

This rule aims to prevent `test.only` from being added to source control.  It's fine to use `.only` locally in development, but this rule aims to prevent it from getting accidentally committed.

Examples of **incorrect** code for this rule:

```js

test.only("foo", async t => {})

```

Examples of **correct** code for this rule:

```js

test("foo", async t => {})

```

## When Not To Use It

If you don't care if people add focused tests to your source code repository.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/organize-tests.html#only-tests>
