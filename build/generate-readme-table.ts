const fs = require("fs");
const path = require("path");
const { rules } = require("../lib");
const { repository } = require("../package.json");

const repoURL = repository.url.replace(/^git:\/\//, "");

const README_LOCATION = path.resolve(__dirname, "..", "README.md");
const BEGIN_TABLE_MARKER = "<!-- __BEGIN AUTOGENERATED RULES TABLE__ -->";
const END_TABLE_MARKER = "<!-- __END AUTOGENERATED RULES TABLE__ -->";

const expectedTableLines = Object.keys(rules)
    .sort()
    .reduce(
        (lines, ruleId) => {
            const rule = rules[ruleId];

            const tr = [
                `[${ruleId}](https://${repoURL}/blob/master/docs/rules/${ruleId}.md)`,
                rule.meta.docs.recommended ? "✔️" : "",
                rule.meta.fixable ? "🛠" : "",
                rule.meta.docs.description
            ].join(" | ");

            lines.push(`| ${tr} |`);

            return lines;
        },
        [
            "| Name  | ✔️     | 🛠     | Description |",
            "| ----- | ----- | ----- | ----------- |"
        ]
    )
    .join("\n");

const readmeContents = fs.readFileSync(README_LOCATION, "utf8");

if (!readmeContents.includes(BEGIN_TABLE_MARKER)) {
    throw new Error(
        `Could not find '${BEGIN_TABLE_MARKER}' marker in README.md.`
    );
}

if (!readmeContents.includes(END_TABLE_MARKER)) {
    throw new Error(
        `Could not find '${END_TABLE_MARKER}' marker in README.md.`
    );
}

const linesStartIndex =
    readmeContents.indexOf(BEGIN_TABLE_MARKER) + BEGIN_TABLE_MARKER.length;
const linesEndIndex = readmeContents.indexOf(END_TABLE_MARKER);

const updatedReadmeContents = [
    readmeContents.slice(0, linesStartIndex),
    expectedTableLines,
    readmeContents.slice(linesEndIndex)
].join("\n");

if (require.main === module) {
    // Run on command line
    fs.writeFileSync(README_LOCATION, updatedReadmeContents);
} else {
    module.exports = updatedReadmeContents;
}
