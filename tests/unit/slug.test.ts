import { describe, expect, it } from "vitest";

import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("normalizes a title into a URL-safe slug", () => {
    expect(generateSlug("Sunday Service: Hope & Grace")).toBe(
      "sunday-service-hope-grace",
    );
  });

  it("collapses separators and trims the result", () => {
    expect(generateSlug("  A__title---with spaces  ")).toBe(
      "a-title-with-spaces",
    );
  });
});
