import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "./LoadingScreen.js";
import { renderWithProviders, screen } from "../test/render.js";

describe("LoadingScreen", () => {
  it("shows the default loading message", () => {
    renderWithProviders(<LoadingScreen />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows a custom message when provided", () => {
    renderWithProviders(<LoadingScreen message="Fetching boards..." />);

    expect(screen.getByText("Fetching boards...")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
