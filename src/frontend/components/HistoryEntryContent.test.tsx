import React from "react";
import { describe, expect, it } from "vitest";

import { ItemStatus } from "../../types.js";
import { renderWithProviders, screen } from "../test/render.js";
import HistoryEntryContent from "./HistoryEntryContent.js";

describe("HistoryEntryContent", () => {
  it("renders date and time for status updates without comment text", () => {
    const { container } = renderWithProviders(
      <HistoryEntryContent
        entry={{
          id: "history-1",
          type: "status_update",
          createdAt: "2026-01-03T10:00:00.000Z",
          username: "alice",
          status: ItemStatus.InProgress,
        }}
      />,
    );

    expect(container.textContent).toMatch(/\d/);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("—");
  });

  it("renders date, time, and comment text for comments", () => {
    const { container } = renderWithProviders(
      <HistoryEntryContent
        entry={{
          id: "history-1",
          type: "comment",
          createdAt: "2026-01-03T10:00:00.000Z",
          username: "alice",
          text: "Looks good",
        }}
      />,
    );

    expect(container.textContent).toMatch(/\d/);
    expect(container.textContent).toContain("—");
    expect(screen.getByText(/Looks good/)).toBeInTheDocument();
  });

  it("linkifies URLs in comments", () => {
    renderWithProviders(
      <HistoryEntryContent
        entry={{
          id: "history-1",
          type: "comment",
          createdAt: "2026-01-03T10:00:00.000Z",
          username: "alice",
          text: "See https://example.com/pr/1",
        }}
      />,
    );

    const link = screen.getByRole("link", {
      name: "https://example.com/pr/1",
    });

    expect(link).toHaveAttribute("href", "https://example.com/pr/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
