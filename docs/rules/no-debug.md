# Don&#39;t allow debug() to be committed to the repository.  (no-debug)

## Rule Details

This rule aims to prevent `t.debug()` from being added to source control.  It's fine to use this locally in development, but this rule aims to prevent it from getting accidentally committed.

Examples of **incorrect** code for this rule:

```js

    test('should do stuff', async (t) => {
        t.debug()
    })

    fixture`foo`.beforeEach( async (t) => {
        await t
        .click(Selector("foo"))
        .debug()
    })

    test('should do stuff', async (t) => {
        await t
        .click(Selector("foo"))
        .debug()
    })
```

Examples of **correct** code for this rule:

```js
t.click()
t.typeText(Selector(".debug"), "Hello")

```

## When Not To Use It

If you don't care if people add debug calls to your source code repository.

## Further Reading

<https://devexpress.github.io/testcafe/documentation/guides/basic-guides/debug.html>
