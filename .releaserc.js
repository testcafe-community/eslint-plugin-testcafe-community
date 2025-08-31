/* `semantic-release` configuration file */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const changelogWriterOpts = require("conventional-changelog-angular/writerOpts");

const thisModule = require("./package.json");

const stableBranch = { name: "master", channel: "stable" };
const nextBranch = { name: "next", channel: "next" };

// Fake/initial value, will be replaced asynchronously by createWriterOpts() below
let angularWriterOpts = {
    // eslint-disable-next-line no-unused-vars
    transform: (commit, context) => {}
};
changelogWriterOpts.createWriterOpts().then((opts) => {
    angularWriterOpts = opts;
});

const getCommitAnalyzerConfig = () => {
    return [
        "@semantic-release/commit-analyzer",
        {
            preset: "angular",
            releaseRules: [
                { type: "build", scope: "deps", release: "patch" },
                { type: "build", scope: "deps-peer", release: "patch" },
                { type: "build", scope: "deps-dev", release: false },
                { type: "docs", scope: "README", release: "patch" },
                { type: "docs", scope: "LICENSE", release: "patch" }
                // Continue matching via commit-analyzer/lib/default-release-rules.js
                // which are the following for the angular preset:
                // { breaking: true, release: 'major' },
                // { revert: true, release: 'patch' },
                // { type: 'feat', release: 'minor' },
                // { type: 'fix', release: 'patch' },
                // { type: 'perf', release: 'patch' },
            ]
        }
    ];
};

const getReleaseNotesGeneratorConfig = () => {
    return [
        "@semantic-release/release-notes-generator",
        {
            preset: "angular",
            writerOpts: {
                transform: (commit, context) => {
                    // Modify transform to include non-breaking Documentation / Build changes in Changelog
                    // This wrapper was based the implementation of conventional-changelog-angular@5.0.13
                    const initCommitTransform = angularWriterOpts.transform(
                        commit,
                        context
                    );

                    if (initCommitTransform) {
                        return initCommitTransform;
                    }

                    // Determine if commit should be in the changelog, logic should match releaseRules above!
                    if (!/^(build|docs)$/.test(commit.type)) {
                        return undefined;
                    }

                    if (
                        commit.type === "build" &&
                        !/^deps(-peer)?$/.test(commit.scope)
                    ) {
                        return undefined;
                    }

                    if (
                        commit.type === "docs" &&
                        !/^(README|LICENSE)$/i.test(commit.scope)
                    ) {
                        return undefined;
                    }

                    // Trigger internal flag 'discard' to be false as it thinks
                    // there is a Breaking Change in this commit
                    commit.notes.push({});

                    // Re-run the original transform
                    const transformedCommit = angularWriterOpts.transform(
                        commit,
                        context
                    );

                    transformedCommit.notes.pop(); // Reset

                    // return transformed commit instead of None
                    return transformedCommit;
                }
            }
        }
    ];
};

const generatePluginConfig = () => {
    const pluginConfDefs = [
        getCommitAnalyzerConfig(),
        getReleaseNotesGeneratorConfig()
    ];

    if (process.env.GITHUB_ACTIONS || false) {
        pluginConfDefs.push("semantic-release-export-data");
    }

    // pluginConfDefs.push([
    //     "@semantic-release/exec",
    //     {
    //         prepareCmd: "node ./scripts/calculate-checksums.mjs"
    //     }
    // ]);

    pluginConfDefs.push(
        [
            "@semantic-release/github",
            {
                assets: [
                    {
                        label: `${thisModule.name} [NPM Package]`,
                        path: `${thisModule.name}*.tgz`
                    }
                    // { label: "Checksums [SHA-256]", path: "checksums.txt" }
                ]
            }
        ],
        "@semantic-release/npm",
        [
            "semantic-release-npm-deprecate-old-versions",
            {
                rules: [
                    {
                        rule: "supportLatest",
                        options: {
                            numberOfMajorReleases: 2
                        }
                    },
                    "deprecateAll"
                ]
            }
        ]
    );

    return pluginConfDefs.filter((def) => def);
};

module.exports = {
    branches: [stableBranch, nextBranch],
    plugins: generatePluginConfig()
};
