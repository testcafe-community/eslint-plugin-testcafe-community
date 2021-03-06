# eslint-plugin-testcafe-community

ESLint rules for [testcafe](https://github.com/DevExpress/testcafe) from the testcafe community.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
npm i eslint --save-dev
```

Next, install `eslint-plugin-testcafe-community`:

```
npm install eslint-plugin-testcafe-community --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-testcafe-community` globally.

## Recommended configuration

This plugin export a recommended configuration that enforce good practices.

To enable this configuration use the extends property in your .eslintrc config file:

```
{
  "plugins": [
    "testcafe-community"
  ],
  "extends": "plugin:testcafe-community/recommended"
}
```

See [ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) for more information about extending configuration files.

## Supported Rules

✔️ indicates that a rule is recommended for all users.

🛠 indicates that a rule is fixable.

<!-- __BEGIN AUTOGENERATED TABLE__ -->Name | ✔️ | 🛠 | Description
----- | ----- | ----- | -----
[expectExpect](https://github.com/testing-library/eslint-plugin-jest-dom/blob/master/docs/rules/expectExpect.md) | ✔️ |  | Ensure tests have at least one expect
[noDebug](https://github.com/testing-library/eslint-plugin-jest-dom/blob/master/docs/rules/noDebug.md) | ✔️ |  | Don't allow `t.debug()` to be committed to the repository. 
[noIdenticalTitle](https://github.com/testing-library/eslint-plugin-jest-dom/blob/master/docs/rules/noIdenticalTitle.md) | ✔️ |  | Don't use identical titles for your tests
[noOnly](https://github.com/testing-library/eslint-plugin-jest-dom/blob/master/docs/rules/noOnly.md) | ✔️ |  | Don't allow `test.only` to be added to the repository
[noSkip](https://github.com/testing-library/eslint-plugin-jest-dom/blob/master/docs/rules/noSkip.md) | ✔️ |  | Don't allow `test.skip` or `fixture.skip` to be added to the repository
<!-- __END AUTOGENERATED TABLE__ -->
