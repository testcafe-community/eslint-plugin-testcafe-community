/**
 * @fileoverview Verify production build of plugin works with eslint & discovers lint errors
 * @author codejedi365
 */

import { promisify } from "util";
import { exec, ExecException, execSync } from "child_process";
import { resolve } from "path";
import { copy, ensureSymlink, remove, writeJSON } from "fs-extra";
import type { Linter, ESLint } from "eslint";
import {
    coerce,
    major,
    minVersion,
    prerelease,
    satisfies,
    validRange
} from "semver";
import thisModule from "../package.json";

const SECOND = 1000;
const SECONDS = SECOND;
const MINUTE = 60 * SECONDS;
const MINUTES = MINUTE;

const PROJECT_BUILD_TIMEOUT = 30 * SECONDS;
const EXAMPLE_PROJECT_INSTALL_TIMEOUT = 1 * MINUTE;
const EXAMPLE_PROJECT_LINT_EVAL_TIMEOUT = 2 * MINUTES;
const EXAMPLE_PROJECT_AUTOFORMAT_TIMEOUT = 0 * SECONDS;
const EXAMPLE_PROJECT_COPY_TIMEOUT = 30 * SECONDS;

const execProcess = promisify(exec);

const baseLintConfig: Linter.Config = {
    root: true,
    env: {
        browser: true,
        es2021: true
    },
    // ignorePatterns: ["!**/*.ts"],
    overrides: [
        {
            files: ["*.ts"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: 12,
                sourceType: "module",
                project: "tsconfig.eslint.json"
            }
        }
    ],
    rules: {}
};

const baseLintConfigOverride: Linter.ConfigOverride = {
    files: ["*.test.{ts,js}"],
    plugins: ["testcafe-community"]
};

async function restoreTestPkg(templateDirectory: string, destDir: string) {
    await remove(destDir).catch();
    await copy(templateDirectory, destDir, {
        filter: (src) => {
            return !/\/node_modules|\.eslintrc\.js/.test(src);
        }
    });

    await ensureSymlink(
        resolve(templateDirectory, "node_modules"),
        resolve(destDir, "node_modules"),
        "dir"
    );
}

async function modifyEslintConfig(
    filePath: string,
    overrides: Partial<Linter.Config>
): Promise<void> {
    // Deep copy of base config
    const eslintConfig = JSON.parse(
        JSON.stringify(baseLintConfig)
    ) as Linter.Config;

    // Append new override
    eslintConfig.overrides = [
        ...(eslintConfig.overrides || []),
        {
            ...baseLintConfigOverride,
            ...overrides
        }
    ];

    await writeJSON(filePath, eslintConfig, { spaces: 4 });
}

async function restoreConfigurationFile(targetFile: string) {
    await modifyEslintConfig(targetFile, {});
}

async function runLintOnProject(
    projPath: string,
    configFilename: string,
    configOverrides: Partial<Linter.Config> = {},
    autofix = false
): Promise<ESLint.LintResult[]> {
    // SETUP: ensure eslint config is set to recommended
    await modifyEslintConfig(
        resolve(projPath, configFilename),
        configOverrides
    );
    // EXECUTE ESLINT via CLI to get results
    const cmd = [
        "npx",
        "eslint",
        ".",
        "--format",
        "json",
        autofix ? "--fix" : ""
    ].join(" ");

    let proc: Partial<{ stdout: string; stderr: string }> = {};
    try {
        proc = await execProcess(cmd, {
            cwd: projPath
        });
        return [];
    } catch (error: unknown) {
        // Should be a rejected promise since lint errors should be detected!
        const err = error as ExecException & {
            stdout: string;
            stderr: string;
        };
        if (err.killed || err.code === 2) {
            // 2 == Oops! Something went wrong!
            throw err;
        }
        proc.stdout = !err.stdout ? "[]" : err.stdout;
        proc.stderr = err.stderr;
    }
    return JSON.parse(proc.stdout) as ESLint.LintResult[];
}

/**
 * Function: Finds all possible eslint library versions and
 * compares them to the given range of `peerDependencies["eslint"]`
 * from `package.json`. Filters and returns the different major
 * versions only.
 *
 * LIMITATION: does not support minor version breakouts or split
 * ranges.
 *
 * @returns Unique Array of major versions within a given range
 */
function getEslintPeerLibraries() {
    const eslintRange = thisModule.peerDependencies.eslint;
    if (!validRange(eslintRange)) {
        throw new Error("Range is not valid!"); // Abort
    }
    const semverObj = minVersion(eslintRange);
    if (!semverObj) {
        throw new Error("Unable to determine minimum version from range!");
    }
    const peers = new Set([semverObj.version]);
    const resultJSON = execSync(
        [
            "npm",
            "info",
            "eslint",
            "versions",
            "--json",
            "--prefer-offline"
        ].join(" "),
        {
            encoding: "utf-8"
        }
    );
    const allVersions = JSON.parse(resultJSON || "{}") as string[];
    allVersions
        .filter((ver) => {
            // No pre-release versions && must satisfy range
            return prerelease(ver) === null && satisfies(ver, eslintRange);
        })
        .forEach((version) => {
            // only check major version compatibility
            const v = coerce(major(version));
            if (!v) return;
            peers.add(v.version);
        });
    return Array.from(peers);
}

describe.each(getEslintPeerLibraries())(
    "eslint@^%s compatibility",
    (eslintVersion: string) => {
        const examplePkg = resolve(__dirname, "..", "example");
        const testPkgPath = resolve(__dirname, "__cache__", "example");

        beforeAll(async function buildAndInstallPkg() {
            // Run plugin build
            await execProcess(["npm", "run", "build"].join(" "), {
                cwd: process.cwd()
            }).catch((error: Error & { stdout: string; stderr: string }) => {
                console.error("Error occured during 'npm run build'");
                console.error(error.stderr);
                console.log(error.stdout);
                throw error;
            });
            // Create production package
            const result = await execProcess(
                ["npm", "pack", "--pack-destination", examplePkg].join(" "),
                {
                    cwd: process.cwd()
                }
            ).catch((error: Error & { stdout: string; stderr: string }) => {
                console.error("Error occured during 'npm pack'");
                console.error(error.stderr);
                console.log(error.stdout);
                throw error;
            });
            const pkgTarball = result.stdout.trim() || "";

            // Run install for example package
            await execProcess(
                [
                    "npm",
                    "install",
                    `eslint@^${eslintVersion}`, // force eslint version
                    pkgTarball, // install production version of plugin
                    "--prefer-offline",
                    "--no-save" // prevent package.json modification
                ].join(" "),
                {
                    cwd: examplePkg
                }
            ).catch((error: Error & { stdout: string; stderr: string }) => {
                console.error("Error occured during 'npm install'");
                console.error(error.stderr);
                console.log(error.stdout);
                throw error;
            });

            // Create a copy of example package
            await restoreTestPkg(examplePkg, testPkgPath);
        }, PROJECT_BUILD_TIMEOUT +
            EXAMPLE_PROJECT_INSTALL_TIMEOUT +
            EXAMPLE_PROJECT_COPY_TIMEOUT);

        afterAll(async () => {
            await remove(testPkgPath);
        });

        describe("recommended", () => {
            let lintResults: ESLint.LintResult[] = [];

            beforeAll(async () => {
                lintResults = await runLintOnProject(
                    testPkgPath,
                    ".eslintrc.json",
                    {
                        extends: ["plugin:testcafe-community/recommended"]
                    }
                );
            }, EXAMPLE_PROJECT_LINT_EVAL_TIMEOUT);

            afterAll(async () => {
                await restoreConfigurationFile(
                    resolve(testPkgPath, ".eslintrc.json")
                );
            });

            it("should report 5 errors, 1 warning, 0 fixable errors, 0 fixable warnings", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            errorCount: 5,
                            warningCount: 1,
                            fixableErrorCount: 0,
                            fixableWarningCount: 0,
                            usedDeprecatedRules: []
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });
        });

        describe("all", () => {
            let lintResults: ESLint.LintResult[] = [];

            beforeAll(async () => {
                lintResults = await runLintOnProject(
                    testPkgPath,
                    ".eslintrc.json",
                    {
                        // TODO: implement all configuration
                        // extends: ["plugin:testcafe-community/all"],
                        extends: ["plugin:testcafe-community/recommended"]
                    }
                );
            }, EXAMPLE_PROJECT_LINT_EVAL_TIMEOUT);

            afterAll(async () => {
                await restoreConfigurationFile(
                    resolve(testPkgPath, ".eslintrc.json")
                );
            });

            it("should report 5 errors, 1 warning, 0 fixable errors, 0 fixable warnings", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            errorCount: 5,
                            warningCount: 1,
                            fixableErrorCount: 0,
                            fixableWarningCount: 0,
                            usedDeprecatedRules: []
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            it("should report an expectExpect rule error", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            messages:
                                expect.arrayContaining<Linter.LintMessage>([
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/expectExpect",
                                        severity: 2,
                                        message:
                                            "Please ensure your test has at least one expect",
                                        line: 17,
                                        column: 1,
                                        nodeType: "CallExpression",
                                        messageId: "missingExpect",
                                        endLine: 20,
                                        endColumn: 3
                                    }) as Linter.LintMessage
                                ]) as Linter.LintMessage[]
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            it("should report a noDebug rule error", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            messages:
                                expect.arrayContaining<Linter.LintMessage>([
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/noDebug",
                                        severity: 2,
                                        message:
                                            "Do not use the `.debug` action.",
                                        line: 19,
                                        column: 7,
                                        nodeType: "Identifier",
                                        messageId: "noDebugMessage",
                                        endLine: 19,
                                        endColumn: 12
                                    }) as Linter.LintMessage
                                ]) as Linter.LintMessage[]
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            it("should report a noIdenticalTitle rule error", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            messages:
                                expect.arrayContaining<Linter.LintMessage>([
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/noIdenticalTitle",
                                        severity: 2,
                                        message:
                                            "Don't use identical titles for your tests",
                                        line: 11,
                                        column: 11,
                                        nodeType: "Literal",
                                        messageId: "noIdenticalTitles",
                                        endLine: 11,
                                        endColumn: 48
                                    }) as Linter.LintMessage,
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/noIdenticalTitle",
                                        severity: 2,
                                        message:
                                            "Don't use identical titles for your tests",
                                        line: 17,
                                        column: 11,
                                        nodeType: "Literal",
                                        messageId: "noIdenticalTitles",
                                        endLine: 17,
                                        endColumn: 48
                                    }) as Linter.LintMessage
                                ]) as Linter.LintMessage[]
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            it("should report a noOnly rule error", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            messages:
                                expect.arrayContaining<Linter.LintMessage>([
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/noOnly",
                                        severity: 2,
                                        message: "Do not use the `.only` hook.",
                                        line: 11,
                                        column: 6,
                                        nodeType: "Identifier",
                                        messageId: "noOnly",
                                        endLine: 11,
                                        endColumn: 10
                                    }) as Linter.LintMessage
                                ]) as Linter.LintMessage[]
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            it("should report a noSkip rule warning", () => {
                expect(lintResults).toEqual<ESLint.LintResult[]>(
                    expect.arrayContaining<ESLint.LintResult>([
                        expect.objectContaining<Partial<ESLint.LintResult>>({
                            filePath: resolve(testPkgPath, "example.test.ts"),
                            messages:
                                expect.arrayContaining<Linter.LintMessage>([
                                    expect.objectContaining<
                                        Partial<Linter.LintMessage>
                                    >({
                                        ruleId: "testcafe-community/noSkip",
                                        severity: 1,
                                        message: "Do not use the `.skip` hook.",
                                        line: 17,
                                        column: 6,
                                        nodeType: "Identifier",
                                        messageId: "noSkip",
                                        endLine: 17,
                                        endColumn: 10
                                    }) as Linter.LintMessage
                                ]) as Linter.LintMessage[]
                        }) as ESLint.LintResult
                    ]) as ESLint.LintResult[]
                );
            });

            describe("--fix", () => {
                let postFixLintResults: ESLint.LintResult[] = [];

                beforeAll(async () => {
                    const autofix = true;
                    postFixLintResults = await runLintOnProject(
                        testPkgPath,
                        ".eslintrc.json",
                        {
                            // TODO: implement all configuration
                            // extends: ["plugin:testcafe-community/all"],
                            extends: ["plugin:testcafe-community/recommended"]
                        },
                        autofix
                    );
                }, EXAMPLE_PROJECT_LINT_EVAL_TIMEOUT + EXAMPLE_PROJECT_AUTOFORMAT_TIMEOUT);

                afterAll(async () => {
                    await restoreTestPkg(examplePkg, testPkgPath);
                });

                it("should report 5 errors, 1 warning, 0 fixable errors, 0 fixable warnings", () => {
                    // Get the number of rules that provide fixes, subtract it from expected number of results
                    // Note that no rules autofix at this time so no results are fixed.
                    expect(postFixLintResults).toEqual<ESLint.LintResult[]>(
                        expect.arrayContaining<ESLint.LintResult>([
                            expect.objectContaining<Partial<ESLint.LintResult>>(
                                {
                                    filePath: resolve(
                                        testPkgPath,
                                        "example.test.ts"
                                    ),
                                    errorCount: 5,
                                    warningCount: 1,
                                    fixableErrorCount: 0,
                                    fixableWarningCount: 0
                                }
                            ) as ESLint.LintResult
                        ]) as ESLint.LintResult[]
                    );
                });
            });
        });
    }
);
