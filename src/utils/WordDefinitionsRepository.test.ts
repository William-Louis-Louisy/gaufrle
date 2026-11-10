import { describe, expect, test, vi } from "vitest";
import { loadDefinitions } from "./WordDefinitionsRepository";

// Mock the data modules, not the loader, to verify the same lazy selection and order.
vi.mock("../jsons/DefFiveLetters.json", () => ({
  default: [
    { word: "POMME", definition: ["Fruit"] },
    { word: "POIRE", definition: ["Autre fruit"] },
  ],
}));
vi.mock("../jsons/DefSevenLetters.json", () => ({
  default: [
    { word: "ABRICOT", definition: ["Fruit à noyau"] },
    { word: "ORANGES", definition: ["Agrumes"] },
  ],
}));

describe("WordDefinitionsRepository", () => {
  test("returns definitions in puzzle order, not dictionary order", async () => {
    expect(await loadDefinitions(["POIRE", "ABRICOT", "POMME"])).toEqual([
      { word: "POIRE", definition: ["Autre fruit"] },
      { word: "ABRICOT", definition: ["Fruit à noyau"] },
      { word: "POMME", definition: ["Fruit"] },
    ]);
  });

  test("omits missing words and unsupported word lengths", async () => {
    expect(await loadDefinitions(["ABSENT", "POMME", "CHAT", "INCONNU"])).toEqual([
      { word: "POMME", definition: ["Fruit"] },
    ]);
  });

  test("does not need a dictionary for an empty puzzle", async () => {
    expect(await loadDefinitions([])).toEqual([]);
  });

  test("preserves repeated puzzle entries", async () => {
    expect(await loadDefinitions(["POMME", "POMME"])).toEqual([
      { word: "POMME", definition: ["Fruit"] },
      { word: "POMME", definition: ["Fruit"] },
    ]);
  });
});
