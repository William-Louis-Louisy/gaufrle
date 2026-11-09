import { render, screen } from "@testing-library/react";
import Victory from "./Victory";
import type { VictoryScore } from "../utils/Scoring";

vi.mock("./CountDown", () => ({ default: () => null }));

const score = (stars: 1 | 2 | 3, movesUsed: number, moveLimit = 20): VictoryScore => ({
  stars,
  movesUsed,
  moveLimit,
});

describe("P1.2 victory presentation", () => {
  test.each([
    [3, 10, "WOW !!!", "3 étoiles sur 3"],
    [2, 15, "Pas mal !", "2 étoiles sur 3"],
    [1, 20, "Piouu !", "1 étoile sur 3"],
  ] as const)("shows %d stars, result message and actual move usage", (stars, movesUsed, message, label) => {
    render(<Victory score={score(stars, movesUsed)} />);
    expect(screen.getByText(message)).not.toBeNull();
    expect(screen.getByRole("img", { name: label })).not.toBeNull();
    expect(screen.getByText(`${movesUsed} / 20 mouvements`)).not.toBeNull();
  });

  test("a win on the last remaining move still renders a reward", () => {
    render(<Victory score={score(1, 7, 7)} weekly />);
    expect(screen.getByRole("img", { name: "1 étoile sur 3" })).not.toBeNull();
    expect(screen.getByText("7 / 7 mouvements")).not.toBeNull();
  });
});
