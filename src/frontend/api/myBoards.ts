import type {
  Board,
  CreateCommentRequest,
  CreateItemRequest,
  UpdateItemRequest,
} from "../../types.js";
import { apiFetch } from "./client.js";

export const listMyBoards = (): Promise<{ boards: Board[] }> =>
  apiFetch<{ boards: Board[] }>("/api/my/boards");

export const getMyBoard = (id: string): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/my/boards/${id}`);

export const createItem = (
  boardId: string,
  request: CreateItemRequest,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/my/boards/${boardId}/items`, {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateItem = (
  boardId: string,
  itemId: string,
  request: UpdateItemRequest,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/my/boards/${boardId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });

export const deleteItem = (
  boardId: string,
  itemId: string,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/my/boards/${boardId}/items/${itemId}`, {
    method: "DELETE",
  });

export const deleteDoneItems = (boardId: string): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/my/boards/${boardId}/items/done`, {
    method: "DELETE",
  });

export const addItemComment = (
  boardId: string,
  itemId: string,
  request: CreateCommentRequest,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(
    `/api/my/boards/${boardId}/items/${itemId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
