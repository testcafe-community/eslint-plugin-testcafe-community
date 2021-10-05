import { parse as parsePath } from "path";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { repository, version } from "../package.json";

const REPO_URL = repository.url
    .replace(/git:\/\//, "https://")
    .replace(/\.git$/, "");

export const createRule = ESLintUtils.RuleCreator((name) => {
    const ruleName = parsePath(name).name;
    return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});
export default createRule;
