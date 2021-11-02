# CONTRIBUTORS

## Issues & PR's

Please fill out associated templates clearly and as detailed as possible for the
requested actions. It is important that you articulate WHAT you are trying to do
and WHY so your request will be considered. Before submission, search and review
all open and previously closed tickets before opening another one. This saves
everyone time!

## Development Environment

-   Use `nvm` for node version management (see `.nvmrc` for version requirement)
-   Use latest npm version via `nvm install-latest-npm`
-   Recommend VSCode & the extensions: ESLint, Git Graph, GitHub Markdown
    Preview.

## Guidelines

-   Code (including Markdown) must pass a linting checks
-   Development environment expectation is NodeJS v16 LTS & `npm@^7.0.0`
-   Must have successful build & pass all test cases in both Node.js v12 LTS,
    v14 LTS, & v16 LTS
-   New features & bugs should include a Test Driven Development (TDD) test case
    that replicates the issue or tests the new feature
-   Code Coverage is expected to be maintained, there are multiple examples of
    how to mock appropriately to handle branch cases & simulated errors
-   Versioning & releases are handled by CI/CD & semantic versioning construct
    which relies upon semantic commits. We use git hooks with commitizen &
    commitlint to help faciliate contributors.
-   Commits should be GPG signed with a validated email address
-   All rules should have matching documentation files and test files with
    matching naming conventions

## Tools

1. **Git Hooks** (autoconfigured on install with Husky)

2. **Semantic commits**: Commitizen interactive commit msg creation, with
   `commitlint` verification

3. **Jest Unit Testing**: Verification exported functions w/ coverage

4. **Jest Integration Test**: Full build and validation of `eslint` plugin
   runtime and results on the included `example/` package. Package is
   deliberately out of expected lint standards to ensure results.

5. **Typescript-eslint**: Full codebase linting for TS, JS, & Markdown files

6. **Rules Table Generation**: Update readme table of rules based on files &
   configured rules. Validated by a unit test.

## Testing

### Local Testing

```sh
# Runs all jest testing projects
npm test

# or separately
npm run test:unit         # unit tests
npm run test:plugin       # integration test

# interactive
npm run watch             # enable test watch mode

# Lint (add ':file -- <filename>' for specific files)
npm run lint              # evaluates entire repository
npm run format            # autofix code
```

### GitHub CI Pipeline

Upon an open Pull Request (PR), GitHub will automatically run the configured CI
actions in order to evaluate and enforce the project standards. You can review
the action steps at `.github/workflows/cicd.yml`. The actions will line up with
the guidelines stated above. PR's will not be accepted until there are no merge
conflicts with the master branch nor failing pipeline actions. Please do your
due diligence.
