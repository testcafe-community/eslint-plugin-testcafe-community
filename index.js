'use strict';

let requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(__dirname + "/lib/rules");
module.exports.generateRecommendedConfig = rules => {
    return Object.entries(rules).reduce(
        (memo, [name, rule]) =>
            rule.meta.docs.recommended
                ? { ...memo, [`testcafe-community/${name}`]: "error" }
                : memo,
        {}
    );
};

module.exports.configs = {

    recommended: {
        globals: {
            fixture: false,
            test: false
        },
        plugins: ["testcafe-community"],
        rules: module.exports.generateRecommendedConfig(module.exports.rules)
    }

};



