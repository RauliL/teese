import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus, type Board } from "../../types.js";
import {
  addItemComment,
  createItem,
  deleteDoneItems,
  deleteItem,
  getMyBoard,
  listMyBoards,
  updateItem,
} from "./myBoards.js";
import { mockFetch } from "./testHelpers.js";

const mockBoard: Board = {
  id: "board-1",
  name: "My board",
  createdAt: "2026-01-01T00:00:00.000Z",
  allowedUsers: ["alice"],
  items: [
    {
      id: "item-1",
      title: "First task",
      createdAt: "2026-01-02T00:00:00.000Z",
      status: ItemStatus.ToDo,
      history: [],
    },
  ],
};

describe("myBoards API", () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("listMyBoards", () => {
    it("fetches boards accessible to the current user", async () => {
      const response = { boards: [mockBoard] };
      fetchMock = mockFetch(response);

      await expect(listMyBoards()).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/my/boards", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("getMyBoard", () => {
    it("fetches a board by id", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(getMyBoard("board-1")).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/my/boards/board-1", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("createItem", () => {
    it("creates an item with a title", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(
        createItem("board-1", { title: "New task" }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith("/api/my/boards/board-1/items", {
        method: "POST",
        body: JSON.stringify({ title: "New task" }),
        headers: expect.any(Headers),
      });
    });

    it("creates an item with an initial status", async () => {
      fetchMock = mockFetch({ board: mockBoard });

      await createItem("board-1", {
        title: "New task",
        status: ItemStatus.InProgress,
      });

      expect(fetchMock).toHaveBeenCalledWith("/api/my/boards/board-1/items", {
        method: "POST",
        body: JSON.stringify({
          title: "New task",
          status: ItemStatus.InProgress,
        }),
        headers: expect.any(Headers),
      });
    });
  });

  describe("updateItem", () => {
    it("updates item fields", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(
        updateItem("board-1", "item-1", {
          title: "Updated task",
          status: ItemStatus.Done,
        }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my/boards/board-1/items/item-1",
        {
          method: "PATCH",
          body: JSON.stringify({
            title: "Updated task",
            status: ItemStatus.Done,
          }),
          headers: expect.any(Headers),
        },
      );
    });
  });

  describe("deleteItem", () => {
    it("deletes an item from a board", async () => {
      const response = { board: { ...mockBoard, items: [] } };
      fetchMock = mockFetch(response);

      await expect(deleteItem("board-1", "item-1")).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my/boards/board-1/items/item-1",
        {
          method: "DELETE",
          headers: expect.any(Headers),
        },
      );
    });
  });

  describe("deleteDoneItems", () => {
    it("deletes all done items from a board", async () => {
      const response = { board: { ...mockBoard, items: [] } };
      fetchMock = mockFetch(response);

      await expect(deleteDoneItems("board-1")).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my/boards/board-1/items/done",
        {
          method: "DELETE",
          headers: expect.any(Headers),
        },
      );
    });
  });

  describe("addItemComment", () => {
    it("adds a comment to an item", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(
        addItemComment("board-1", "item-1", { text: "Looks good" }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my/boards/board-1/items/item-1/comments",
        {
          method: "POST",
          body: JSON.stringify({ text: "Looks good" }),
          headers: expect.any(Headers),
        },
      );
    });
  });
});
