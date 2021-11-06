
import * as path from "path";
import { ClientFunction, Selector } from "testcafe";

const getBrowserURL = ClientFunction(() => document.location.href);

fixture("MyHTMLPage-TS")
    .page(`file://${path.join(__dirname, "src", "index.html")}`);

// Lint Error: no-focused-tests, no-duplicate-titles
test.only("Page loads and displays hello world", async (t: TestController) => {
    await t.expect(getBrowserURL()).match(/file:\/\/.+\/src\/index.html/);
    await t.expect(Selector("p").withText("Hello World").exists).ok();
});

// Lint Error: no-disabled-tests, no-duplicate-titles, missing-expect
test.skip("Page loads and displays hello world", async (t: TestController) => {
    // Lint Error: no-debug
    t.debug()
})
