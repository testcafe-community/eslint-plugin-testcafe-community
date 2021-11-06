import { parse as parsePath } from "path";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import semverCoerce from "semver/functions/coerce";
import thisPkg from "../package.json";

const pkgVersion = semverCoerce(thisPkg.version)?.version;
const REPO_URL = thisPkg.repository.url
    .replace(/git:\/\//, "https://")
    .replace(/\.git$/, "");

export const createRule = ESLintUtils.RuleCreator((name) => {
    const ruleName = parsePath(name).name;
    const tag = !pkgVersion ? "master" : `v${pkgVersion}`;
    return `${REPO_URL}/blob/${tag}/docs/rules/${ruleName}.md`;
});
export default createRule;
