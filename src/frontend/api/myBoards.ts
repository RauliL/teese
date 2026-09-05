import type {
  Board,
  CreateCommentRequest,
  CreateItemRequest,
  ItemStatus,
  UpdateItemRequest,
} from "../../types.js";
import { apiFetch } from "./client.js";

export async function listMyBoards(): Promise<{ boards: Board[] }> {
  return apiFetch<{ boards: Board[] }>("/api/my/boards");
}

export async function getMyBoard(id: string): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(`/api/my/boards/${id}`);
}

export async function createItem(
  boardId: string,
  request: CreateItemRequest,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(`/api/my/boards/${boardId}/items`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateItem(
  boardId: string,
  itemId: string,
  request: UpdateItemRequest,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(
    `/api/my/boards/${boardId}/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );
}

export async function deleteItem(
  boardId: string,
  itemId: string,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(
    `/api/my/boards/${boardId}/items/${itemId}`,
    { method: "DELETE" },
  );
}

export async function addItemComment(
  boardId: string,
  itemId: string,
  request: CreateCommentRequest,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(
    `/api/my/boards/${boardId}/items/${itemId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export type { ItemStatus };
