const baseConfig = require("../.remarkrc");

module.exports = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        ["remark-lint-no-file-name-irregular-characters", false],
        ["remark-lint-no-file-name-mixed-case", false]
    ]
};
