import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus } from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { mockBoard, mockItem } from "../../test/fixtures.js";
import { renderWithProviders, screen, waitFor } from "../../test/render.js";
import { KanbanBoard } from "./KanbanBoard.js";

vi.mock("../../api/myBoards.js", () => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
}));

const mockCreateItem = vi.mocked(myBoardsApi.createItem);
const mockUpdateItem = vi.mocked(myBoardsApi.updateItem);

describe("KanbanBoard", () => {
  const onBoardUpdated = vi.fn();

  beforeEach(() => {
    onBoardUpdated.mockReset();
    mockCreateItem.mockReset();
    mockUpdateItem.mockReset();
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
        mockItem({ id: "item-new", title: "New task", status: ItemStatus.ToDo }),
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

  it("opens the item dialog when an item is clicked", async () => {
    const user = userEvent.setup();
    const board = mockBoard({
      items: [mockItem({ title: "Open me" })],
    });

    renderWithProviders(
      <KanbanBoard board={board} onBoardUpdated={onBoardUpdated} />,
    );

    await user.click(screen.getByText("Open me"));

    expect(
      await screen.findByRole("dialog", { name: "Item details" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Open me")).toBeInTheDocument();
  });
});
