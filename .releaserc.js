module.exports = {
    branches: ["master", "next"],
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/changelog",
        "@semantic-release/npm",
        "@semantic-release/github",
        [
            "semantic-release-npm-deprecate-old-versions",
            {
                rules: [
                    "supportLatest",
                    "supportPreReleaseIfNotReleased",
                    "deprecateAll"
                ]
            }
        ]
    ]
};
