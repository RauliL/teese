import { ItemStatus, type Board, type Item } from "../../types.js";

export const mockItem = (overrides: Partial<Item> = {}): Item => ({
  id: "item-1",
  title: "First task",
  createdAt: "2026-01-02T00:00:00.000Z",
  status: ItemStatus.ToDo,
  history: [],
  ...overrides,
});

export const mockBoard = (overrides: Partial<Board> = {}): Board => ({
  id: "board-1",
  name: "Sprint board",
  createdAt: "2026-01-01T00:00:00.000Z",
  allowedUsers: ["alice"],
  items: [mockItem()],
  ...overrides,
});
