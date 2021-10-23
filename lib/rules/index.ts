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
import noOnly from "./no-only";
import noSkip from "./no-skip";
import noIdenticalTitle from "./no-identical-title";
import expectExpect from "./expect-expect";

// Add export entry to this object for rule definition to be recognized
export default {
    get rules(): {
        [key: string]: RuleModule<string, unknown[], RuleListener>;
    } {
        return {
            noDebug,
            noSkip,
            noOnly,
            noIdenticalTitle,
            expectExpect
        };
    }
};
