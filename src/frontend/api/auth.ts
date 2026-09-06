import type { LoginRequest, LoginResponse, PublicUser } from "../../types.js";
import { apiFetch } from "./client.js";

export const login = (credentials: LoginRequest): Promise<LoginResponse> =>
  apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getCurrentUser = (): Promise<{ user: PublicUser }> =>
  apiFetch<{ user: PublicUser }>("/api/auth/me");

export const createUser = (request: {
  username: string;
  password: string;
  isAdmin?: boolean;
}): Promise<{ user: PublicUser }> =>
  apiFetch<{ user: PublicUser }>("/api/users", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const listUsers = (): Promise<{ users: PublicUser[] }> =>
  apiFetch<{ users: PublicUser[] }>("/api/users");

export const deleteUser = (username: string): Promise<void> =>
  apiFetch(`/api/users/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
