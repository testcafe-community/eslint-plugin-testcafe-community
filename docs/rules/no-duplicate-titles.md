# `no-duplicate-titles`

_Don't allow duplicate titles for tests._

## Rule Details

This rule aims to prevent duplicate test names to exist. All tests should have
an unique name across the entire repository. It becomes difficult to identify
where a failing test is implemented with the default output from TestCafe
already and duplicate names would be even worse. This rule will catch incomplete
copy/paste, then edit errors by your developers.

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

When it is not problematic to have multiple tests with the same name.

## Further Reading

<https://testcafe.io/documentation/402831/guides/basic-guides/organize-tests#tests>
