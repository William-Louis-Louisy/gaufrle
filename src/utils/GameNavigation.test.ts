import { describe, expect, test } from "vitest";
import { GAME_NAVIGATION } from "./GameNavigation";

describe("shared navigation metadata", () => {
  test("preserves the public modes, routes, labels and images", () => {
    expect(GAME_NAVIGATION).toEqual([
      {
        name: "Gaufrette",
        href: "/normal-game",
        imgSrc: "/images/normal.webp",
        imgAlt: "Médaille de bronze",
      },
      {
        name: "Gauf' au suc'",
        href: "/medium-game",
        imgSrc: "/images/medium.webp",
        imgAlt: "Médaille d'argent",
      },
      {
        name: "Gaufre salée",
        href: "/hard-game",
        imgSrc: "/images/hard.webp",
        imgAlt: "Médaille d'or",
      },
    ]);
  });
});
