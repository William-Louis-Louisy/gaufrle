import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SeoHead from "./SeoHead";
import { getSeoPage } from "../utils/Seo";

function NavigateButtons() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate("/hard-game")}>Difficulty</button>
      <button onClick={() => navigate("/no-such-page")}>Unknown</button>
      <button onClick={() => navigate("/")}>Home</button>
    </>
  );
}

function readMeta(selector: string) {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content;
}

describe("SEO on client-side navigation", () => {
  it("replaces metadata and structured data without accumulating tags", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SeoHead />
        <NavigateButtons />
      </MemoryRouter>
    );

    const home = getSeoPage("/");
    expect(document.title).toBe(home?.title);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(home?.url);
    expect(JSON.parse(document.getElementById("gaufrle-structured-data")?.textContent ?? "{}")["@type"])
      .toBe("WebApplication");

    screen.getByRole("button", { name: "Difficulty" }).click();
    await waitFor(() => expect(document.title).toBe(getSeoPage("/hard-game")?.title));
    expect(readMeta('meta[name="description"]')).toBe(getSeoPage("/hard-game")?.description);
    expect(readMeta('meta[property="og:url"]')).toBe(getSeoPage("/hard-game")?.url);
    expect(readMeta('meta[name="twitter:title"]')).toBe(getSeoPage("/hard-game")?.title);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe(getSeoPage("/hard-game")?.url);
    expect(JSON.parse(document.getElementById("gaufrle-structured-data")?.textContent ?? "{}")["@type"])
      .toBe("WebPage");

    screen.getByRole("button", { name: "Unknown" }).click();
    await waitFor(() => expect(readMeta('meta[name="robots"]')).toBe("noindex,follow"));
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);
    expect(document.getElementById("gaufrle-structured-data")).toBeNull();

    screen.getByRole("button", { name: "Home" }).click();
    await waitFor(() => expect(readMeta('meta[name="robots"]')).toBe("index,follow"));
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('#gaufrle-structured-data')).toHaveLength(1);
  });
});
