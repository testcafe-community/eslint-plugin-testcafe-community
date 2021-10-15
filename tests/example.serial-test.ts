/**
 * @fileoverview Verify production build of plugin works with eslint & discovers lint errors
 * @author codejedi365
 */

import { promisify } from "util";
import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { resolve } from "path";
import { copy, ensureSymlink, readJSON, remove, writeJSON } from "fs-extra";
import type { Linter } from "eslint";

const spawnProcess: (
    arg1: string,
    arg2: readonly string[],
    arg3: SpawnOptions
) => Promise<ChildProcess> = promisify(spawn);

async function modifyEslintConfig(
    filePath: string,
    overrides: Record<string, unknown>
): Promise<void> {
    const eslintConfig = (await readJSON(filePath)) as Linter.Config;
    await writeJSON(filePath, {
        ...eslintConfig,
        ...overrides
    });
}

describe("eslint-plugin-testcafe", () => {
    const examplePkg = resolve(__dirname, "..", "example");
    const testPkgPath = resolve(__dirname, "__cache__", "example");

    beforeAll(async () => {
        // Run plugin build
        await spawnProcess("npm", ["run", "build"], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: true,
            cwd: process.cwd()
        }).catch((error: Error & { stdout: string; stderr: string }) => {
            console.error("Error occured during 'npm run build'");
            console.error(error.stderr);
            console.log(error.stdout);
            throw error;
        });
        // Run install for example package
        await spawnProcess("npm", ["ci", "--prefer-offline"], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: true,
            cwd: examplePkg
        }).catch((error: Error & { stdout: string; stderr: string }) => {
            console.error("Error occured during 'npm ci'");
            console.error(error.stderr);
            console.log(error.stdout);
            throw error;
        });
    });

    beforeEach(async () => {
        // Create a copy of example package
        await copy(examplePkg, testPkgPath, {
            filter: (src) => {
                return !/\/node_modules\//.test(src);
            }
        });
        await ensureSymlink(
            resolve(examplePkg, "node_modules"),
            resolve(testPkgPath, "node_modules"),
            "dir"
        );
    });

    afterEach(async () => {
        // Remove the example package copy
        await remove(testPkgPath);
    });

    it("should find 5 errors in example package with the recommended ruleset", async () => {
        // SETUP: ensure eslint config is set to recommended
        await modifyEslintConfig(resolve(testPkgPath, ".eslintrc.json"), {
            extends: ["plugin:testcafe-community/recommended"],
            plugins: ["testcafe-community"]
        });
        // Execute
        const lintProc: ChildProcess = await spawnProcess(
            "npx",
            ["eslint", ".", "--format", "json"],
            {
                stdio: ["ignore", "pipe", "pipe"],
                shell: true,
                cwd: examplePkg
            }
        );
        const lintResults: unknown = JSON.parse(lintProc.stdout.toString());
        expect(lintResults).toEqual([]);
    });

    it("should find 5 errors in example package with all rules on", async () => {
        // SETUP: change eslint config is set to all
        await modifyEslintConfig(resolve(testPkgPath, ".eslintrc.json"), {
            extends: ["plugin:testcafe-community/all"],
            plugins: ["testcafe-community"]
        });
        // Execute
        const lintProc: ChildProcess = await spawnProcess(
            "npx",
            ["eslint", ".", "--format", "json"],
            {
                stdio: ["ignore", "pipe", "pipe"],
                shell: true,
                cwd: examplePkg
            }
        );
        const lintResults: unknown = JSON.parse(lintProc.stdout.toString());
        expect(lintResults).toEqual([]);
    });

    describe("auto-fix", () => {
        it("should fix errors in example package when --fix is provided", async () => {
            // Get the number of rules that provide fixes, subtract it from expected number of results
            // change the eslint config to all
            // SETUP: ensure eslint config is set to recommended
            await modifyEslintConfig(resolve(testPkgPath, ".eslintrc.json"), {
                extends: ["plugin:testcafe-community/recommended"],
                plugins: ["testcafe-community"]
            });
            // Execute
            // Note that no rules autofix at this time so no results are fixed.
            const lintProc: ChildProcess = await spawnProcess(
                "npx",
                ["eslint", ".", "--fix", "--format", "json"],
                {
                    stdio: ["ignore", "pipe", "pipe"],
                    shell: true,
                    cwd: examplePkg
                }
            );
            const lintResults: unknown = JSON.parse(lintProc.stdout.toString());
            expect(lintResults).toEqual([]);
        });
    });
});
