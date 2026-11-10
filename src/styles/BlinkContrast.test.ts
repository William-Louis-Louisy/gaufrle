import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/global.css"), "utf8");
const DARK_TEXT = "#232629";
const LIGHT_TEXT = "#FBFBF2";
const MINIMUM_WCAG_AA = 4.5;

function keyframeStops(name: string): { at: number; color: string }[] {
  const start = css.indexOf(`@keyframes ${name} {`);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("@keyframes", start + 1);
  const block = css.slice(start, end < 0 ? undefined : end);
  const stops = [...block.matchAll(
    /([\d%,\s]+)\{\s*background-color:\s*(#[0-9a-fA-F]{6})/g,
  )].flatMap((match) =>
    match[1].split(",").map((percent) => ({
      at: Number.parseInt(percent.trim(), 10),
      color: match[2],
    })),
  );
  return stops.sort((a, b) => a.at - b.at);
}

function rgb(hex: string): number[] {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: number[]): number {
  const [red, green, blue] = color.map(channel);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: number[]): number {
  const values = [luminance(rgb(foreground)), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function intermediate(first: string, second: string, fraction: number): number[] {
  const source = rgb(first);
  const destination = rgb(second);
  return source.map((value, i) => value + (destination[i] - value) * fraction);
}

describe("accessible victory celebration", () => {
  it.each([
    ["blink", DARK_TEXT],
    ["blink-dark", LIGHT_TEXT],
  ])("%s maintains AA contrast throughout sRGB-interpolated keyframes", (name, foreground) => {
    const stops = keyframeStops(name);
    expect(stops.map((stop) => stop.at)).toEqual([0, 20, 40, 60, 80, 100]);
    for (let i = 0; i < stops.length - 1; i++) {
      for (let sample = 0; sample <= 100; sample++) {
        const background = intermediate(stops[i].color, stops[i + 1].color, sample / 100);
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(MINIMUM_WCAG_AA);
      }
    }
  });

  it("preserves the original green completion state with legible dark text", () => {
    expect(css).toMatch(/\.correct-cell\s*\{\s*@apply bg-valid cell;/);
    expect(contrast(DARK_TEXT, rgb("#38b000"))).toBeGreaterThanOrEqual(MINIMUM_WCAG_AA);
    expect(css).toMatch(/\.blink-cell\s*\{[^}]*color:\s*#232629;/s);
  });

  it("keeps the celebration finite, preserves staggered cells and reduced motion", () => {
    expect(css).toMatch(/animation:\s*blink 2\.4s ease-in-out 2;/);
    expect(css).not.toMatch(/animation:\s*blink [^;]*infinite/);
    expect(css).toMatch(/\.dark \.blink-cell\s*\{\s*animation-name:\s*blink-dark;/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*?\.blink-cell[\s\S]*?animation:\s*none !important;/);
  });
});
