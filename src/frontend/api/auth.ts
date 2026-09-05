import type { LoginRequest, LoginResponse, PublicUser } from "../../types.js";
import { apiFetch } from "./client.js";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(): Promise<{ user: PublicUser }> {
  return apiFetch<{ user: PublicUser }>("/api/auth/me");
}

export async function createUser(request: {
  username: string;
  password: string;
  isAdmin?: boolean;
}): Promise<{ user: PublicUser }> {
  return apiFetch<{ user: PublicUser }>("/api/users", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function listUsers(): Promise<{ users: PublicUser[] }> {
  return apiFetch<{ users: PublicUser[] }>("/api/users");
}

export async function deleteUser(username: string): Promise<void> {
  await apiFetch(`/api/users/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
}
