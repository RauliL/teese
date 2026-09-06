import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus } from "../../types.js";
import * as myBoardsApi from "../api/myBoards.js";
import { ApiError } from "../api/client.js";
import { KanbanItemPage } from "./KanbanItemPage.js";
import { mockBoard, mockItem } from "../test/fixtures.js";
import { renderWithProviders, screen, waitFor } from "../test/render.js";

vi.mock("../layouts/AppLayout.js", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../api/myBoards.js", () => ({
  getMyBoard: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  addItemComment: vi.fn(),
}));

const mockGetMyBoard = vi.mocked(myBoardsApi.getMyBoard);
const mockUpdateItem = vi.mocked(myBoardsApi.updateItem);
const mockDeleteItem = vi.mocked(myBoardsApi.deleteItem);
const mockAddItemComment = vi.mocked(myBoardsApi.addItemComment);

function renderItemPage(initialEntry = "/boards/board-1/items/item-1") {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/boards/:boardId/items/:itemId"
          element={<KanbanItemPage />}
        />
        <Route path="/boards/:boardId" element={<div>Board view</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("KanbanItemPage", () => {
  const confirmMock = vi.fn();

  beforeEach(() => {
    confirmMock.mockReset();
    vi.stubGlobal("confirm", confirmMock);
    mockGetMyBoard.mockReset();
    mockUpdateItem.mockReset();
    mockDeleteItem.mockReset();
    mockAddItemComment.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders item details and history", async () => {
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({
        items: [
          mockItem({
            title: "Review PR",
            history: [
              {
                id: "history-1",
                type: "comment",
                createdAt: "2026-01-03T10:00:00.000Z",
                username: "alice",
                text: "Looks good",
              },
            ],
          }),
        ],
      }),
    });

    renderItemPage();

    expect(
      await screen.findByRole("heading", { name: "Item details" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Review PR")).toBeInTheDocument();
    expect(screen.getByText("alice commented")).toBeInTheDocument();
    expect(screen.getByText(/Looks good/)).toBeInTheDocument();
  });

  it("saves changes and returns to the board", async () => {
    const user = userEvent.setup();
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({
        items: [mockItem({ title: "Old title" })],
      }),
    });
    mockUpdateItem.mockResolvedValue({
      board: mockBoard({
        items: [mockItem({ title: "New title", status: ItemStatus.Done })],
      }),
    });

    renderItemPage();

    const titleField = await screen.findByDisplayValue("Old title");
    await user.clear(titleField);
    await user.type(titleField, "New title");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith("board-1", "item-1", {
        title: "New title",
        status: ItemStatus.ToDo,
      });
      expect(screen.getByText("Board view")).toBeInTheDocument();
    });
  });

  it("deletes the item after confirmation", async () => {
    const user = userEvent.setup();
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({
        items: [mockItem({ title: "Remove me" })],
      }),
    });
    confirmMock.mockReturnValue(true);
    mockDeleteItem.mockResolvedValue({ board: mockBoard({ items: [] }) });

    renderItemPage();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledWith('Delete item "Remove me"?');
      expect(mockDeleteItem).toHaveBeenCalledWith("board-1", "item-1");
      expect(screen.getByText("Board view")).toBeInTheDocument();
    });
  });

  it("does not delete the item when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({ items: [mockItem()] }),
    });
    confirmMock.mockReturnValue(false);

    renderItemPage();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(mockDeleteItem).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Item details" }),
    ).toBeInTheDocument();
  });

  it("adds a comment to the item", async () => {
    const user = userEvent.setup();
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({ items: [mockItem()] }),
    });
    mockAddItemComment.mockResolvedValue({
      board: mockBoard({
        items: [
          mockItem({
            history: [
              {
                id: "history-2",
                type: "comment",
                createdAt: "2026-01-04T12:00:00.000Z",
                username: "alice",
                text: "Ship it",
              },
            ],
          }),
        ],
      }),
    });

    renderItemPage();

    const commentFields = await screen.findAllByLabelText("Add comment");
    await user.type(commentFields[0], "Ship it");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(mockAddItemComment).toHaveBeenCalledWith("board-1", "item-1", {
        text: "Ship it",
      });
      expect(screen.getByText(/Ship it/)).toBeInTheDocument();
    });
  });

  it("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({ items: [mockItem()] }),
    });
    mockUpdateItem.mockRejectedValue(new ApiError(500, "Update failed"));

    renderItemPage();

    await user.click(await screen.findByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Update failed");
    expect(screen.queryByText("Board view")).not.toBeInTheDocument();
  });

  it("shows not found when the item is missing from the board", async () => {
    mockGetMyBoard.mockResolvedValue({
      board: mockBoard({ items: [] }),
    });

    renderItemPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Item not found.",
    );
    expect(screen.getByRole("link", { name: "Back to board" })).toHaveAttribute(
      "href",
      "/boards/board-1",
    );
  });
});
