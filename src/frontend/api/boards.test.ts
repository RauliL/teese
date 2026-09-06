import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatus, type Board, type BoardSummary } from "../../types.js";
import {
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  updateBoard,
} from "./boards.js";
import { mockFetch } from "./testHelpers.js";

const mockBoardSummary: BoardSummary = {
  id: "board-1",
  name: "Sprint board",
  createdAt: "2026-01-01T00:00:00.000Z",
  itemCount: 2,
  allowedUserCount: 1,
  openForEveryone: false,
};

const mockBoard: Board = {
  id: "board-1",
  name: "Sprint board",
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

describe("boards API", () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("listBoards", () => {
    it("fetches all board summaries", async () => {
      const response = { boards: [mockBoardSummary] };
      fetchMock = mockFetch(response);

      await expect(listBoards()).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/boards", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("getBoard", () => {
    it("fetches a board by id", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(getBoard("board-1")).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/boards/board-1", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("createBoard", () => {
    it("creates a board with a name", async () => {
      const response = { board: mockBoard };
      fetchMock = mockFetch(response);

      await expect(createBoard({ name: "Sprint board" })).resolves.toEqual(
        response,
      );

      expect(fetchMock).toHaveBeenCalledWith("/api/boards", {
        method: "POST",
        body: JSON.stringify({ name: "Sprint board" }),
        headers: expect.any(Headers),
      });
    });

    it("creates a board with allowed users", async () => {
      fetchMock = mockFetch({ board: mockBoard });

      await createBoard({ name: "Sprint board", allowedUsers: ["alice"] });

      expect(fetchMock).toHaveBeenCalledWith("/api/boards", {
        method: "POST",
        body: JSON.stringify({
          name: "Sprint board",
          allowedUsers: ["alice"],
        }),
        headers: expect.any(Headers),
      });
    });
  });

  describe("updateBoard", () => {
    it("updates board fields", async () => {
      const response = { board: { ...mockBoard, name: "Renamed board" } };
      fetchMock = mockFetch(response);

      await expect(
        updateBoard("board-1", {
          name: "Renamed board",
          allowedUsers: ["alice", "bob"],
        }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith("/api/boards/board-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed board",
          allowedUsers: ["alice", "bob"],
        }),
        headers: expect.any(Headers),
      });
    });
  });

  describe("deleteBoard", () => {
    it("deletes a board by id", async () => {
      fetchMock = mockFetch({});

      await expect(deleteBoard("board-1")).resolves.toEqual({});
      expect(fetchMock).toHaveBeenCalledWith("/api/boards/board-1", {
        method: "DELETE",
        headers: expect.any(Headers),
      });
    });
  });
});
