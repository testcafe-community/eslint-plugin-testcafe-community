//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
// WARNING: Exports in this file must match ./globals.d.ts in order for
//   the packed plugin types to coorespond with the exports it provides

import type { TestCafeLint } from "./globals";
import rulebook from "./rules";

const generateRecommendedConfig = (): Partial<TestCafeLint.RuleRecords> => {
    return Object.entries(rulebook.rules).reduce((memo, [name, rule]) => {
        return !rule.meta.docs
            ? memo
            : {
                  ...memo,
                  [`testcafe-community/${name}`]: rule.meta.docs.recommended
              };
    }, {});
};

export const { rules } = rulebook;

export const configs = {
    get recommended(): TestCafeLint.Config.Recommended {
        return {
            globals: {
                fixture: false,
                test: false
            },
            plugins: ["testcafe-community"],
            rules: generateRecommendedConfig()
        };
    }
};
