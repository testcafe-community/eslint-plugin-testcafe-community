# Example Package

This folder is a barebones webpage that has TestCafe journey tests for
validation. An example configuration for importing the
`eslint-plugin-testcafe-community` plugin is provided below.

```js
// .eslintrc.js
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true
    },
    extends: ["eslint:recommended"],
    overrides: [
        {
            // for Typescript projects
            files: ["*.ts"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: 12,
                sourceType: "module",
                project: "tsconfig.eslint.json"
            },
            extends: "plugin:@typescript-eslint/recommended",
            plugins: ["@typescript-eslint"]
        },
        {
            files: ["*.test.{ts,js}"],
            extends: ["plugin:testcafe-community/recommended"],
            plugins: ["testcafe-community"]
        }
    ],
    rules: {}
};
```

The journey test [`example.test.ts`](./example.test.ts) is expected to have at
least one example of all invalid configurations according to the
`testcafe-community` ruleset. This is designed to exemplify how the
`testcafe-community` plugin will identify the poor programming patterns in
TestCafe test suites.

## Integration

See [`example.serial-test.ts`](../tests/example.serial-test.ts) for the higher
level integration test which relies upon this example package configuration. The
`jest` test runner will evaluate the validity of the testcafe-community plugin's
integration with ESLint and its effectiveness.
