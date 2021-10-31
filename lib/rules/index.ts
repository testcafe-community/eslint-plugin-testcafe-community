/**
 * @fileoverview easy import file to grab all rules in folder
 * @author codejedi365
 */
import type {
    RuleListener,
    RuleModule
} from "@typescript-eslint/experimental-utils/dist/ts-eslint";

// Add Import for any new rules to this list with camelCase
import noDebug from "./no-debug";
import noFocusedTests from "./no-focused-tests";
import noDisabledTests from "./no-disabled-tests";
import noDuplicateTitles from "./no-duplicate-titles";
import missingExpect from "./missing-expect";

// Add export entry to this object for rule definition to be recognized
export default {
    get rules(): {
        [key: string]: RuleModule<string, unknown[], RuleListener>;
    } {
        return {
            "missing-expect": missingExpect,
            "no-debug": noDebug,
            "no-disabled-tests": noDisabledTests,
            "no-duplicate-titles": noDuplicateTitles,
            "no-focused-tests": noFocusedTests
        };
    }
};
