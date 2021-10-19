# Example Package

This folder is a barebones webpage that has TestCafe journey tests for
validation. This package represents the ESLint configuration
[.eslintrc.json](./.eslintrc.json) needed to import the
`eslint-plugin-testcafe-community` plugin and evaluate a file.

The journey test is expected to have at least one example of all invalid
configurations to exemplify how the `testcafe-community` plugin will identify
the poor programming patterns in TestCafe test suites.

## Integration

See [`example.serial-test.ts`](../tests/example.serial-test.ts) for the higher
level integration test which relies upon this example package configuration. The
`jest` test runner will evaluate the validity of the testcafe-community plugin's
integration with ESLint and its effectiveness.
