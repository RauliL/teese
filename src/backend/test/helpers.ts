import type { Express } from "express";
import request from "supertest";
import { vi } from "vitest";
import type { PublicUser } from "../../types.js";

export type TestContext = {
  app: Express;
  createUser: typeof import("../users.js").createUser;
};

export async function setupBackendTest(): Promise<TestContext> {
  vi.resetModules();

  process.env.NODE_ENV = "test";

  const [{ default: app }, { createUser }] = await Promise.all([
    import("../index.js"),
    import("../users.js"),
  ]);

  return { app, createUser };
}

export async function login(
  app: Express,
  username: string,
  password: string,
): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username, password });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.status} ${response.text}`);
  }

  return response.body.token as string;
}

export function withAuth(app: Express, token: string) {
  const authorization = `Bearer ${token}`;

  return {
    get: (path: string) =>
      request(app).get(path).set("Authorization", authorization),
    post: (path: string) =>
      request(app).post(path).set("Authorization", authorization),
    patch: (path: string) =>
      request(app).patch(path).set("Authorization", authorization),
    delete: (path: string) =>
      request(app).delete(path).set("Authorization", authorization),
  };
}

export async function seedAdmin(
  createUser: TestContext["createUser"],
): Promise<PublicUser> {
  return createUser({
    username: "admin",
    password: "password123",
    isAdmin: true,
  });
}

export async function seedRegularUser(
  createUser: TestContext["createUser"],
  username = "alice",
): Promise<PublicUser> {
  return createUser({
    username,
    password: "password123",
    isAdmin: false,
  });
}

export { request };
