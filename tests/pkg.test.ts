import { promisify } from "util";
import { exec } from "child_process";
import { coerce, major, validRange } from "semver";
import thisModule from "../package.json";

const execProcess = promisify(exec);

describe("package.json", () => {
    it("should have valid semver range for the eslint peerDependency", () => {
        expect(validRange(thisModule.peerDependencies.eslint)).toBeTruthy();
    });

    it("should not be updated manually (unless major version tag found)", async () => {
        let majorVersion = "[0-9]+";
        try {
            const result = await execProcess(
                ["git", "describe", "--tags", "--abbrev=0"].join(" ")
            );
            const tmp = coerce(result.stdout);
            majorVersion = !tmp ? majorVersion : major(tmp.version).toString();
        } catch (err) {
            // Ignore, git probably wasn't found. allow any number.
        }
        expect(thisModule.version).toMatch(
            new RegExp(`${majorVersion}\\.0\\.0-autoversioned`)
        );
    });
});
