import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus } from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { mockBoard, mockItem } from "../../test/fixtures.js";
import { renderWithProviders, screen, waitFor } from "../../test/render.js";
import { KanbanBoard } from "./KanbanBoard.js";

vi.mock("../../api/myBoards.js", () => ({
  createItem: vi.fn(),
  deleteDoneItems: vi.fn(),
  updateItem: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCreateItem = vi.mocked(myBoardsApi.createItem);
const mockDeleteDoneItems = vi.mocked(myBoardsApi.deleteDoneItems);
const mockUpdateItem = vi.mocked(myBoardsApi.updateItem);

describe("KanbanBoard", () => {
  const onBoardUpdated = vi.fn();
  const confirmMock = vi.fn();

  beforeEach(() => {
    confirmMock.mockReset();
    vi.stubGlobal("confirm", confirmMock);
    onBoardUpdated.mockReset();
    mockNavigate.mockReset();
    mockCreateItem.mockReset();
    mockDeleteDoneItems.mockReset();
    mockUpdateItem.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders status columns and items", () => {
    const board = mockBoard({
      items: [
        mockItem({ id: "item-1", title: "Todo task", status: ItemStatus.ToDo }),
        mockItem({
          id: "item-2",
          title: "Done task",
          status: ItemStatus.Done,
        }),
      ],
    });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    expect(screen.getByText("Todo task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
    expect(screen.getByText("ToDo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("creates a new item in the todo column", async () => {
    const user = userEvent.setup();
    const board = mockBoard({ items: [] });
    const updatedBoard = mockBoard({
      items: [
        mockItem({
          id: "item-new",
          title: "New task",
          status: ItemStatus.ToDo,
        }),
      ],
    });
    mockCreateItem.mockResolvedValue({ board: updatedBoard });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /^New item/ }),
      "New task",
    );
    await user.click(screen.getByRole("button", { name: "Add to ToDo" }));

    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalledWith("board-1", {
        title: "New task",
        status: ItemStatus.ToDo,
      });
      expect(onBoardUpdated).toHaveBeenCalledWith(updatedBoard);
    });
  });

  it("shows an error when item creation fails", async () => {
    const user = userEvent.setup();
    mockCreateItem.mockRejectedValue(new ApiError(500, "Create failed"));

    renderWithProviders(
      <KanbanBoard board={mockBoard()} onBoardUpdated={onBoardUpdated} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /^New item/ }),
      "Broken task",
    );
    await user.click(screen.getByRole("button", { name: "Add to ToDo" }));

    expect(await screen.findByText("Create failed")).toBeInTheDocument();
  });

  it("opens the item page when an item is clicked", async () => {
    const user = userEvent.setup();
    const board = mockBoard({
      items: [mockItem({ id: "item-1", title: "Open me" })],
    });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    await user.click(screen.getByText("Open me"));

    expect(mockNavigate).toHaveBeenCalledWith("/boards/board-1/items/item-1");
  });

  it("deletes all done items after confirmation", async () => {
    const user = userEvent.setup();
    confirmMock.mockReturnValue(true);
    const board = mockBoard({
      items: [
        mockItem({ id: "item-1", title: "Todo task", status: ItemStatus.ToDo }),
        mockItem({
          id: "item-2",
          title: "Done task",
          status: ItemStatus.Done,
        }),
      ],
    });
    const updatedBoard = mockBoard({
      items: [
        mockItem({ id: "item-1", title: "Todo task", status: ItemStatus.ToDo }),
      ],
    });
    mockDeleteDoneItems.mockResolvedValue({ board: updatedBoard });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    await user.click(screen.getByRole("button", { name: "Delete all done" }));

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledWith("Delete 1 done item?");
      expect(mockDeleteDoneItems).toHaveBeenCalledWith("board-1");
      expect(onBoardUpdated).toHaveBeenCalledWith(updatedBoard);
    });
  });

  it("does not delete done items when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    confirmMock.mockReturnValue(false);
    const board = mockBoard({
      items: [
        mockItem({
          id: "item-2",
          title: "Done task",
          status: ItemStatus.Done,
        }),
      ],
    });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    await user.click(screen.getByRole("button", { name: "Delete all done" }));

    expect(confirmMock).toHaveBeenCalled();
    expect(mockDeleteDoneItems).not.toHaveBeenCalled();
    expect(onBoardUpdated).not.toHaveBeenCalled();
  });

  it("does not show delete done button when the done column is empty", () => {
    const board = mockBoard({
      items: [
        mockItem({ id: "item-1", title: "Todo task", status: ItemStatus.ToDo }),
      ],
    });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    expect(
      screen.queryByRole("button", { name: "Delete all done" }),
    ).not.toBeInTheDocument();
  });
});
