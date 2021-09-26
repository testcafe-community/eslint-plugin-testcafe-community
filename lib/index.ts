//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

import {
    RuleListener,
    RuleMetaDataDocs,
    RuleModule
} from "@typescript-eslint/experimental-utils/dist/ts-eslint";
import noDebug from "./rules/no-debug";
import noOnly from "./rules/no-only";
import noSkip from "./rules/no-skip";
import noIdenticalTitle from "./rules/no-identical-title";
import expectExpect from "./rules/expect-expect";

export const rules: {
    [key: string]: RuleModule<string, unknown[], RuleListener>;
} = {
    noDebug,
    noSkip,
    noOnly,
    noIdenticalTitle,
    expectExpect
};

export const generateRecommendedConfig = (): Record<
    string,
    RuleMetaDataDocs["recommended"]
> => {
    return Object.entries(rules).reduce((memo, [name, rule]) => {
        return !rule.meta.docs
            ? memo
            : {
                  ...memo,
                  [`testcafe-community/${name}`]: rule.meta.docs.recommended
              };
    }, {});
};

export const configs = {
    recommended: {
        globals: {
            fixture: false,
            test: false
        },
        plugins: ["testcafe-community"],
        rules: generateRecommendedConfig()
    }
};
