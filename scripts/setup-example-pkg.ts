/**
 * @fileoverview Install & configure example package for development / testing
 * @author codejedi365
 */
/* eslint prettier/prettier: ["error", { printWidth: 100 }] */
/* eslint import/no-extraneous-dependencies: ["error", { devDependencies: true }] */
/* eslint no-console: "off" */
import { promisify } from "util";
import { exec } from "child_process";
import { relative, resolve } from "path";
import { writeJSON, pathExists } from "fs-extra";
import { createInterface, Interface } from "readline";
import type { Linter } from "eslint";

const execProcess = promisify(exec);
const examplePkgDir = resolve(__dirname, "..", "example");
const exPkgLintConfigFile = resolve(examplePkgDir, ".eslintrc.json");
const cli: Interface = createInterface({
    input: process.stdin,
    output: process.stdout
});
// eslint-disable-next-line @typescript-eslint/unbound-method
const askQuestion = promisify(cli.question).bind(cli) as (query: string) => Promise<string>;

async function askUser(prompt: string): Promise<string> {
    const answer = await askQuestion(prompt);
    return answer.trim();
}

async function modifyEslintConfig(filePath: string): Promise<void> {
    // Should match example/README.md example of an eslintrc file
    const eslintConfig: Linter.Config = {
        root: true,
        env: {
            browser: true,
            es2021: true,
            node: true
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

    if (await pathExists(filePath)) {
        const shortFileName = relative(process.cwd(), filePath);
        console.error(`WARN: '${shortFileName}' found!`);
        let response = null;
        while (response === null) {
            let answer = "";
            try {
                // eslint-disable-next-line no-await-in-loop
                answer = await askUser(`Do you want to overwrite ${shortFileName} (Y/n)? `);
            } catch (e) {
                return Promise.reject(e);
            }
            if (/^Y|YES|YEP$/i.test(answer)) {
                response = true;
            } else if (/^N|NO|NOPE$/i.test(answer)) {
                response = false;
            } else {
                console.error("Unexpected response, Please try again.");
            }
        }
        if (!response) {
            return Promise.reject(new Error("User prevented ESLint config overwrite."));
        }
    }
    return writeJSON(filePath, eslintConfig, { spaces: 4 });
}

async function installPkg() {
    // Run install for example package
    await execProcess(
        [
            "npm",
            "install",
            "--prefer-offline",
            "--no-save" // prevent package.json modification
        ].join(" "),
        {
            cwd: examplePkgDir
        }
    ).catch((error: Error & { stdout: string; stderr: string }) => {
        console.error("Error occured during 'npm install'");
        console.error(error.stderr);
        console.log(error.stdout);
        throw error;
    });
}

function main() {
    Promise.all([installPkg(), modifyEslintConfig(exPkgLintConfigFile)])
        .then(() => {
            console.log("[+] Example package setup successful!");
        })
        .catch(() => {
            console.error("[-] Error occured during setup. Exiting...");
            process.exitCode = 1;
        })
        .finally(() => {
            cli.close();
        });
}

/**
 * ON_SCRIPT_LOAD
 */
if (require.main === module) {
    // Run on command line
    main();
} else {
    module.exports = {
        setup: main
    };
}
