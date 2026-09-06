import { randomUUID } from "node:crypto";
import type {
  Board,
  BoardSummary,
  CreateBoardRequest,
  CreateItemRequest,
  HistoryEntry,
  Item,
  UpdateBoardRequest,
  UpdateItemRequest,
} from "../types.js";
import { ItemStatus } from "../types.js";
import { storage } from "./storage.js";
import { getUser } from "./users.js";

export const BOARDS_NAMESPACE = "boards";

export class BoardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoardValidationError";
  }
}

export class BoardNotFoundError extends Error {
  constructor(message = "Board not found.") {
    super(message);
    this.name = "BoardNotFoundError";
  }
}

export class BoardAccessDeniedError extends Error {
  constructor(message = "You do not have access to this board.") {
    super(message);
    this.name = "BoardAccessDeniedError";
  }
}

export class ItemNotFoundError extends Error {
  constructor(message = "Item not found.") {
    super(message);
    this.name = "ItemNotFoundError";
  }
}

function now(): string {
  return new Date().toISOString();
}

function isItemStatus(value: unknown): value is ItemStatus {
  return (
    typeof value === "string" &&
    Object.values(ItemStatus).includes(value as ItemStatus)
  );
}

function validateBoardName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new BoardValidationError("Board name is required.");
  }

  if (name.trim().length > 200) {
    throw new BoardValidationError(
      "Board name must be at most 200 characters.",
    );
  }

  return name.trim();
}

function validateItemTitle(title: unknown): string {
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new BoardValidationError("Item title is required.");
  }

  if (title.trim().length > 200) {
    throw new BoardValidationError(
      "Item title must be at most 200 characters.",
    );
  }

  return title.trim();
}

function validateCommentText(text: unknown): string {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new BoardValidationError("Comment text is required.");
  }

  if (text.trim().length > 2000) {
    throw new BoardValidationError("Comment must be at most 2000 characters.");
  }

  return text.trim();
}

function createStatusHistoryEntry(
  username: string,
  status: ItemStatus,
): HistoryEntry {
  return {
    id: randomUUID(),
    type: "status_update",
    createdAt: now(),
    username,
    status,
  };
}

function createCommentHistoryEntry(
  username: string,
  text: string,
): HistoryEntry {
  return {
    id: randomUUID(),
    type: "comment",
    createdAt: now(),
    username,
    text,
  };
}

function normalizeBoard(board: Board): Board {
  return {
    ...board,
    allowedUsers: board.allowedUsers ?? [],
    items: board.items ?? [],
  };
}

async function validateAllowedUsers(value: unknown): Promise<string[]> {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new BoardValidationError("Allowed users must be an array.");
  }

  const allowedUsers: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      throw new BoardValidationError("Allowed users must be valid usernames.");
    }

    const username = entry.trim();

    if (allowedUsers.includes(username)) {
      continue;
    }

    if (!(await getUser(username))) {
      throw new BoardValidationError(`User "${username}" does not exist.`);
    }

    allowedUsers.push(username);
  }

  return allowedUsers.sort((a, b) => a.localeCompare(b));
}

export function userHasBoardAccess(
  board: Board,
  username: string,
  isAdmin: boolean,
): boolean {
  if (isAdmin) {
    return true;
  }

  return normalizeBoard(board).allowedUsers.includes(username);
}

async function getBoardOrThrow(id: string): Promise<Board> {
  const board = await storage.get<Board>(BOARDS_NAMESPACE, id);

  if (!board) {
    throw new BoardNotFoundError();
  }

  return normalizeBoard(board);
}

function findItem(board: Board, itemId: string): Item {
  const item = board.items.find((entry) => entry.id === itemId);

  if (!item) {
    throw new ItemNotFoundError();
  }

  return item;
}

export async function listAccessibleBoards(
  username: string,
  isAdmin: boolean,
): Promise<Board[]> {
  const boards: Board[] = [];

  for await (const [, board] of storage.entries<Board>(BOARDS_NAMESPACE)) {
    const normalizedBoard = normalizeBoard(board);

    if (userHasBoardAccess(normalizedBoard, username, isAdmin)) {
      boards.push(normalizedBoard);
    }
  }

  return boards.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAccessibleBoard(
  id: string,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  const board = await getBoardOrThrow(id);

  if (!userHasBoardAccess(board, username, isAdmin)) {
    throw new BoardAccessDeniedError();
  }

  return board;
}

export async function createItemWithAccess(
  boardId: string,
  request: CreateItemRequest,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  await getAccessibleBoard(boardId, username, isAdmin);
  return createItem(boardId, request, username);
}

export async function updateItemWithAccess(
  boardId: string,
  itemId: string,
  request: UpdateItemRequest,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  await getAccessibleBoard(boardId, username, isAdmin);
  return updateItem(boardId, itemId, request, username);
}

export async function deleteItemWithAccess(
  boardId: string,
  itemId: string,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  await getAccessibleBoard(boardId, username, isAdmin);
  return deleteItem(boardId, itemId);
}

export async function deleteDoneItemsWithAccess(
  boardId: string,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  await getAccessibleBoard(boardId, username, isAdmin);
  return deleteDoneItems(boardId);
}

export async function addItemCommentWithAccess(
  boardId: string,
  itemId: string,
  text: string,
  username: string,
  isAdmin: boolean,
): Promise<Board> {
  await getAccessibleBoard(boardId, username, isAdmin);
  return addItemComment(boardId, itemId, text, username);
}

export async function listBoardSummaries(): Promise<BoardSummary[]> {
  const summaries: BoardSummary[] = [];

  for await (const [id, board] of storage.entries<Board>(BOARDS_NAMESPACE)) {
    const normalizedBoard = normalizeBoard(board);
    summaries.push({
      id,
      name: normalizedBoard.name,
      createdAt: normalizedBoard.createdAt,
      itemCount: normalizedBoard.items.length,
      allowedUserCount: normalizedBoard.allowedUsers.length,
    });
  }

  return summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBoard(id: string): Promise<Board | undefined> {
  const board = await storage.get<Board>(BOARDS_NAMESPACE, id);
  return board ? normalizeBoard(board) : undefined;
}

export async function createBoard(
  request: CreateBoardRequest,
): Promise<Board> {
  const name = validateBoardName(request.name);
  const allowedUsers = await validateAllowedUsers(request.allowedUsers);
  const id = randomUUID();
  const board: Board = {
    id,
    name,
    createdAt: now(),
    allowedUsers,
    items: [],
  };

  await storage.set(BOARDS_NAMESPACE, id, board);
  return board;
}

export async function updateBoard(
  id: string,
  request: UpdateBoardRequest,
): Promise<Board> {
  const board = await getBoardOrThrow(id);

  if (request.name !== undefined) {
    board.name = validateBoardName(request.name);
  }

  if (request.allowedUsers !== undefined) {
    board.allowedUsers = await validateAllowedUsers(request.allowedUsers);
  }

  await storage.set(BOARDS_NAMESPACE, id, board);
  return board;
}

export async function deleteBoard(id: string): Promise<boolean> {
  if (!(await storage.has(BOARDS_NAMESPACE, id))) {
    throw new BoardNotFoundError();
  }

  return storage.delete(BOARDS_NAMESPACE, id);
}

export async function createItem(
  boardId: string,
  request: CreateItemRequest,
  username: string,
): Promise<Board> {
  const board = await getBoardOrThrow(boardId);
  const title = validateItemTitle(request.title);
  const status = request.status ?? ItemStatus.ToDo;

  if (request.status !== undefined && !isItemStatus(request.status)) {
    throw new BoardValidationError("Invalid item status.");
  }

  const item: Item = {
    id: randomUUID(),
    title,
    createdAt: now(),
    status,
    history: [createStatusHistoryEntry(username, status)],
  };

  board.items.push(item);
  await storage.set(BOARDS_NAMESPACE, boardId, board);
  return board;
}

export async function updateItem(
  boardId: string,
  itemId: string,
  request: UpdateItemRequest,
  username: string,
): Promise<Board> {
  const board = await getBoardOrThrow(boardId);
  const item = findItem(board, itemId);

  if (request.title !== undefined) {
    item.title = validateItemTitle(request.title);
  }

  if (request.status !== undefined) {
    if (!isItemStatus(request.status)) {
      throw new BoardValidationError("Invalid item status.");
    }

    if (item.status !== request.status) {
      item.status = request.status;
      item.history.push(createStatusHistoryEntry(username, request.status));
    }
  }

  await storage.set(BOARDS_NAMESPACE, boardId, board);
  return board;
}

export async function deleteItem(
  boardId: string,
  itemId: string,
): Promise<Board> {
  const board = await getBoardOrThrow(boardId);
  const itemIndex = board.items.findIndex((entry) => entry.id === itemId);

  if (itemIndex === -1) {
    throw new ItemNotFoundError();
  }

  board.items.splice(itemIndex, 1);
  await storage.set(BOARDS_NAMESPACE, boardId, board);
  return board;
}

export async function deleteDoneItems(boardId: string): Promise<Board> {
  const board = await getBoardOrThrow(boardId);
  board.items = board.items.filter((item) => item.status !== ItemStatus.Done);
  await storage.set(BOARDS_NAMESPACE, boardId, board);
  return board;
}

export async function addItemComment(
  boardId: string,
  itemId: string,
  text: string,
  username: string,
): Promise<Board> {
  const board = await getBoardOrThrow(boardId);
  const item = findItem(board, itemId);
  const commentText = validateCommentText(text);

  item.history.push(createCommentHistoryEntry(username, commentText));
  await storage.set(BOARDS_NAMESPACE, boardId, board);
  return board;
}
