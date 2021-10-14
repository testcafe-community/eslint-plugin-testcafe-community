
import path from "path";
import { ClientFunction, Selector } from "testcafe";

const getBrowserURL = ClientFunction(() => document.location.href);

fixture("MyHTMLPage")
    .page(`file://${path.join(__dirname, "src", "index.html")}`);

test("Page loads and displays hello world", async (t: TestController) => {
    await t.expect(getBrowserURL()).match(/file:\/\/.+\/src\/index.html/);
    await t.expect(Selector("p").withText("Hello World")).ok();
});
