import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { usePublicationDate } from "../hooks/usePublicationDate";
import GridUnavailable from "../components/GridUnavailable";
import GridTitle from "../components/GridTitle";

function DateProbe() {
  return <span data-testid="publication-date">{usePublicationDate()}</span>;
}

describe("live Europe/Paris publication day", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("refreshes the date automatically at Paris midnight without reloading", () => {
    vi.setSystemTime(new Date("2027-09-05T21:59:59.000Z"));
    render(<DateProbe />);

    expect(screen.getByTestId("publication-date").textContent).toBe("2027-09-05");
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByTestId("publication-date").textContent).toBe("2027-09-06");
  });

  test("refreshes at winter midnight 23:00 UTC, not midnight UTC", () => {
    vi.setSystemTime(new Date("2026-11-09T22:59:59.000Z"));
    render(<DateProbe />);

    expect(screen.getByTestId("publication-date").textContent).toBe("2026-11-09");
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByTestId("publication-date").textContent).toBe("2026-11-10");
  });

  test("refreshes after the page regains focus from a suspended tab", () => {
    vi.setSystemTime(new Date("2027-09-05T15:00:00.000Z"));
    render(<DateProbe />);
    expect(screen.getByTestId("publication-date").textContent).toBe("2027-09-05");

    act(() => {
      vi.setSystemTime(new Date("2027-09-06T10:00:00.000Z"));
      fireEvent.focus(window);
    });
    expect(screen.getByTestId("publication-date").textContent).toBe("2027-09-06");
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

  test.each([
    { mode: "normal" as const, date: "2047-08-29", title: "Gaufrette du jour" },
    { mode: "medium" as const, date: "2031-10-04", title: "Gauf' au suc' du jour" },
  ])("shows the new publication date after the $mode catalogue restarts", ({ mode, date, title }) => {
    const { container } = render(<GridTitle gridType={mode} periodStart={date} />);
    expect(container.textContent).toContain(title);
    const [year, month, day] = date.split("-");
    expect(container.textContent).toContain(`du ${day}/${month}/${year}`);
  });
});
