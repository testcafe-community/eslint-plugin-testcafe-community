# All tests should have at least one assertion via t.expect().  (expect-expect)

## Rule Details

This rule aims to ensure a `t.expect()` function call exists within a defined test block. There maybe times in local development you don't have an assertion defined, but this rule aims to prevent a test case from being accidentally committed and falsfully report a pass when it doesn't test any condition.

Examples of **incorrect** code for this rule:

```js
    // Example 1: Forgot to add an assertion but provided an action
    test('should do stuff', async (t) => {
        await t.click(Selector("foo"))
    })

    // Example 2: empty test scaffolding
    test('test something', (t) => {
        // TODO: Test something
    })
```

Examples of **correct** code for this rule:

```js
    test('should change text to clicked', async (t) => {
        const text = Selector("bar")
        await t.click(Selector("foo"))
        await t.expect(text).toEqual("button clicked") // Makes an assertion
    })
```

## When Not To Use It

If you don't care if people add empty test cases to your source code repository.

## Further Reading

<https://testcafe.io/documentation/402837/guides/basic-guides/assert>
