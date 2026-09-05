import type {
  Board,
  BoardSummary,
  CreateBoardRequest,
  UpdateBoardRequest,
} from "../../types.js";
import { apiFetch } from "./client.js";

export async function listBoards(): Promise<{ boards: BoardSummary[] }> {
  return apiFetch<{ boards: BoardSummary[] }>("/api/boards");
}

export async function getBoard(id: string): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(`/api/boards/${id}`);
}

export async function createBoard(
  request: CreateBoardRequest,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>("/api/boards", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateBoard(
  id: string,
  request: UpdateBoardRequest,
): Promise<{ board: Board }> {
  return apiFetch<{ board: Board }>(`/api/boards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteBoard(id: string): Promise<void> {
  await apiFetch(`/api/boards/${id}`, { method: "DELETE" });
}
