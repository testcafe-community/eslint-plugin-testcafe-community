# Don't allow an identical test title to be committed to the repository. (no-identical-title)

## Rule Details

This rule aims to prevent duplicate test names to exist. All tests should have
an unique name across the entire repository.

Examples of **incorrect** code for this rule:

```js
test("should see a button to click", async (t) => {
    await t.expect(Selector("foo").value).toEqual("Click Me!");
});

// Duplicate title
test("should see a button to click", async (t) => {
    await t.click(Selector("foo"));
    await t.expect(Selector("foo").value).toEqual("Clicked");
});
```

Examples of **correct** code for this rule:

```js
// 2 different titles
test("should see a button to click", async (t) => {
    await t.expect(Selector("foo").value).toEqual("Click Me!");
});
test("should see button text change after clicked", async (t) => {
    await t.click(Selector("foo"));
    await t.expect(Selector("foo").value).toEqual("Clicked");
});
```

## When Not To Use It

If you don't care if people add tests with the same name to your source code
repository.

## Further Reading

<https://testcafe.io/documentation/402831/guides/basic-guides/organize-tests#tests>
