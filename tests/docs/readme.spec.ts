import fs from "fs-extra";
import { resolve } from "path";
import { createHash } from "crypto";
import { exec as execCallback } from "child_process";
import { promisify } from "util";

const SECONDS = 1000;
const exec = promisify(execCallback);
const README_LOCATION = resolve(__dirname, "..", "..", "README.md");

describe("README.md", () => {
    describe("check", () => {
        const README_BACKUP_LOCATION = `${README_LOCATION}.bkup`;
        beforeAll(async () => {
            // create backup of original file
            await fs.copyFile(README_LOCATION, README_BACKUP_LOCATION);
        });

        afterAll(async () => {
            // restore from backup file
            await fs.move(README_BACKUP_LOCATION, README_LOCATION, {
                overwrite: true
            });
        });

        it(
            "should be up-to-date with included rules",
            async () => {
                const originalReadmeContents = await fs.readFile(
                    README_BACKUP_LOCATION
                );
                const expectedHash = createHash("sha1")
                    .update(originalReadmeContents)
                    .digest("hex");
                await exec("npm run build:readme");
                const newReadmeContents = await fs.readFile(README_LOCATION);
                const actualHash = createHash("sha1")
                    .update(newReadmeContents)
                    .digest("hex");
                expect(actualHash).toEqual(expectedHash);
            },
            30 * SECONDS
        );
    });

    it(
        "should be properly formatted markdown",
        async () => {
            await expect(
                exec(`npx eslint --ext md "${README_LOCATION}"`)
            ).resolves.toBeTruthy();
        },
        30 * SECONDS
    );
});
