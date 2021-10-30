
const path = require("path");
const { ClientFunction, Selector } = require("testcafe");

const getBrowserURL = ClientFunction(() => document.location.href);

fixture("MyHTMLPage-JSTest")
    .page(`file://${path.join(__dirname, "src", "index.html")}`);

// Lint Error: noOnly, noIdenticalTitle
test.only("Page loads and displays hello world", async (t) => {
    await t.expect(getBrowserURL()).match(/file:\/\/.+\/src\/index.html/);
    await t.expect(Selector("p").withText("Hello World").exists).ok();
});

// Lint Error: noSkip, noIdenticalTitle, expectExpect
test.skip("Page loads and displays hello world", async (t) => {
    // Lint Error: noDebug
    t.debug()
})
