import type {
  Board,
  BoardSummary,
  CreateBoardRequest,
  UpdateBoardRequest,
} from "../../types.js";
import { apiFetch } from "./client.js";

export const listBoards = (): Promise<{ boards: BoardSummary[] }> =>
  apiFetch<{ boards: BoardSummary[] }>("/api/boards");

export const getBoard = (id: string): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/boards/${id}`);

export const createBoard = (
  request: CreateBoardRequest,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>("/api/boards", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateBoard = (
  id: string,
  request: UpdateBoardRequest,
): Promise<{ board: Board }> =>
  apiFetch<{ board: Board }>(`/api/boards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });

export const deleteBoard = (id: string): Promise<void> =>
  apiFetch(`/api/boards/${id}`, { method: "DELETE" });
