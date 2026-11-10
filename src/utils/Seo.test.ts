import { describe, expect, it } from "vitest";
import { createStructuredData, getSeoPage, SEO_PAGES, SITE_ORIGIN } from "./Seo";

describe("SEO route configuration", () => {
  it("assigns a unique canonical and title to every public route", () => {
    expect(SEO_PAGES).toHaveLength(5);
    expect(new Set(SEO_PAGES.map((page) => page.url)).size).toBe(SEO_PAGES.length);
    expect(new Set(SEO_PAGES.map((page) => page.title)).size).toBe(SEO_PAGES.length);
    SEO_PAGES.forEach((page) => {
      expect(page.url).toBe(new URL(page.pathname, SITE_ORIGIN).href);
      expect(page.description.length).toBeGreaterThan(60);
    });
  });

  it("ignores query strings implicitly and normalizes trailing slashes", () => {
    expect(getSeoPage("/normal-game/")?.pathname).toBe("/normal-game");
    expect(getSeoPage("/")?.pathname).toBe("/");
  });

  it("never assigns an indexable page to unknown URLs", () => {
    expect(getSeoPage("/does-not-exist")).toBeNull();
    expect(getSeoPage("/hard-game/extra")).toBeNull();
  });

  it("provides factual structured data, without invented ratings", () => {
    const homepage = getSeoPage("/");
    expect(homepage).not.toBeNull();
    if (!homepage) throw new Error("Missing homepage SEO config");
    const data = createStructuredData(homepage);
    expect(data["@type"]).toBe("WebApplication");
    expect(data["isAccessibleForFree"]).toBe(true);
    expect(data).not.toHaveProperty("aggregateRating");
  });
});
