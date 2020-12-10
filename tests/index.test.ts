
import { generateRecommendedConfig } from "../lib";

it.skip("should have a recommended config with recommended rules", () => {
  expect(
    generateRecommendedConfig()
  ).toEqual({ "testcafe-community/good": "error" });
});
