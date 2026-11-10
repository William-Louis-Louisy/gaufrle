import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import InstallApp from "./InstallApp";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: false,
    media: "(display-mode: standalone)",
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })));
});

describe("P2.3 install guidance", () => {
  test("shows genuine browser instructions when no install prompt is available", () => {
    render(<InstallApp />);
    fireEvent.click(screen.getByRole("button", { name: "Comment installer ?" }));
    expect(screen.getByText(/Chrome Android/)).not.toBeNull();
    expect(screen.getByText(/Sur iPhone/)).not.toBeNull();
  });

  test("uses Chromium's captured prompt after a direct user gesture", async () => {
    const prompt = vi.fn(async () => undefined);
    render(<InstallApp />);
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Installer Gaufrle" }));
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Comment installer ?" })).not.toBeNull();
  });

  test("hides install controls once the app is installed", () => {
    render(<InstallApp />);
    fireEvent(window, new Event("appinstalled"));
    expect(screen.queryByRole("button")).toBeNull();
  });
});
