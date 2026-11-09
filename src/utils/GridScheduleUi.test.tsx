import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useCurrentUtcDate } from "../hooks/useCurrentUtcDate";
import GridUnavailable from "../components/GridUnavailable";
import GridTitle from "../components/GridTitle";

function DateProbe() {
  return <span data-testid="utc-date">{useCurrentUtcDate()}</span>;
}

describe("live UTC publication day", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("refreshes the date automatically at UTC midnight without reloading", () => {
    jest.setSystemTime(new Date("2027-09-05T23:59:59.000Z"));
    render(<DateProbe />);

    expect(screen.getByTestId("utc-date").textContent).toBe("2027-09-05");
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(screen.getByTestId("utc-date").textContent).toBe("2027-09-06");
  });

  test("refreshes after the page regains focus from a suspended tab", () => {
    jest.setSystemTime(new Date("2027-09-05T15:00:00.000Z"));
    render(<DateProbe />);
    expect(screen.getByTestId("utc-date").textContent).toBe("2027-09-05");

    act(() => {
      jest.setSystemTime(new Date("2027-09-06T10:00:00.000Z"));
      fireEvent.focus(window);
    });
    expect(screen.getByTestId("utc-date").textContent).toBe("2027-09-06");
  });
});

describe("fallback and calendar display", () => {
  test("explains a missing puzzle rather than showing an infinite loader", () => {
    render(
      <MemoryRouter>
        <GridUnavailable weekly />
      </MemoryRouter>
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Aucune grille valide n'est disponible pour cette semaine."
    );
    expect(screen.getByRole("link", { name: "Retour à l'accueil" }).getAttribute("href"))
      .toBe("/");
  });

  test("shows the actual cycle week, not the puzzle's original publication date", () => {
    render(<GridTitle gridType="hard" periodStart="2027-09-06" />);
    expect(screen.queryByText("du 06/09/2027 au 12/09/2027")).not.toBeNull();
  });
});
