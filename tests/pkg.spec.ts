import { validRange } from "semver";
import thisModule from "../package.json";

describe("package.json", () => {
    it("should have valid semver range for the eslint peerDependency", () => {
        expect(validRange(thisModule.peerDependencies.eslint)).toBeTruthy();
    });

    it("should not be updated manually", () => {
        expect(thisModule.version).toEqual("0.0.0-semantically-versioned");
    });
});
