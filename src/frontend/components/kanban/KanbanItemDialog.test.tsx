import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus } from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { mockBoard, mockItem } from "../../test/fixtures.js";
import { renderWithProviders, screen, waitFor } from "../../test/render.js";
import { KanbanItemDialog } from "./KanbanItemDialog.js";

vi.mock("../../api/myBoards.js", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  addItemComment: vi.fn(),
}));

const mockUpdateItem = vi.mocked(myBoardsApi.updateItem);
const mockDeleteItem = vi.mocked(myBoardsApi.deleteItem);
const mockAddItemComment = vi.mocked(myBoardsApi.addItemComment);

describe("KanbanItemDialog", () => {
  const onClose = vi.fn();
  const onBoardUpdated = vi.fn();
  const confirmMock = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onBoardUpdated.mockReset();
    confirmMock.mockReset();
    vi.stubGlobal("confirm", confirmMock);
    mockUpdateItem.mockReset();
    mockDeleteItem.mockReset();
    mockAddItemComment.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders item details and history", () => {
    const item = mockItem({
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
    });

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={item}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Item details" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Review PR")).toBeInTheDocument();
    expect(screen.getByText("alice commented")).toBeInTheDocument();
    expect(screen.getByText(/Looks good/)).toBeInTheDocument();
  });

  it("saves changes and closes the dialog", async () => {
    const user = userEvent.setup();
    const item = mockItem({ title: "Old title" });
    const updatedBoard = mockBoard({
      items: [mockItem({ title: "New title", status: ItemStatus.Done })],
    });
    mockUpdateItem.mockResolvedValue({ board: updatedBoard });

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={item}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    const titleField = screen.getByDisplayValue("Old title");
    await user.clear(titleField);
    await user.type(titleField, "New title");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith("board-1", "item-1", {
        title: "New title",
        status: ItemStatus.ToDo,
      });
      expect(onBoardUpdated).toHaveBeenCalledWith(updatedBoard);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("deletes the item after confirmation", async () => {
    const user = userEvent.setup();
    const item = mockItem({ title: "Remove me" });
    const updatedBoard = mockBoard({ items: [] });
    confirmMock.mockReturnValue(true);
    mockDeleteItem.mockResolvedValue({ board: updatedBoard });

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={item}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledWith('Delete item "Remove me"?');
      expect(mockDeleteItem).toHaveBeenCalledWith("board-1", "item-1");
      expect(onBoardUpdated).toHaveBeenCalledWith(updatedBoard);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("does not delete the item when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    confirmMock.mockReturnValue(false);

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={mockItem()}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockDeleteItem).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("adds a comment to the item", async () => {
    const user = userEvent.setup();
    const item = mockItem();
    const updatedBoard = mockBoard({
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
    });
    mockAddItemComment.mockResolvedValue({ board: updatedBoard });

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={item}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    const commentFields = screen.getAllByLabelText("Add comment");
    await user.type(commentFields[0], "Ship it");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(mockAddItemComment).toHaveBeenCalledWith("board-1", "item-1", {
        text: "Ship it",
      });
      expect(onBoardUpdated).toHaveBeenCalledWith(updatedBoard);
    });
  });

  it("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    mockUpdateItem.mockRejectedValue(new ApiError(500, "Update failed"));

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={mockItem()}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Update failed");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes the dialog when Close is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <KanbanItemDialog
        boardId="board-1"
        item={mockItem()}
        open
        onClose={onClose}
        onBoardUpdated={onBoardUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });
});
