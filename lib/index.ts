//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

import type { Linter } from "eslint";
import rulebook from "./rules";

export const generateRecommendedConfig = (): Partial<Linter.RulesRecord> => {
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
    get recommended(): Linter.Config {
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
