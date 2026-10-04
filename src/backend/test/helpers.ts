import type { Express } from "express";
import { PublicUser, addUser } from "express-varasto-jwt-auth";
import request from "supertest";
import { vi } from "vitest";

export type TestContext = {
  app: Express;
  addUser: (
    username: string,
    password: string,
    isAdmin?: boolean,
  ) => Promise<PublicUser>;
};

export async function setupBackendTest(): Promise<TestContext> {
  vi.resetModules();

  process.env.NODE_ENV = "test";

  const [{ default: app }, { storage }] = await Promise.all([
    import("../index.js"),
    import("../storage.js"),
  ]);

  return {
    app,
    addUser: (username, password, isAdmin = false) =>
      addUser(storage, username, password, isAdmin),
  };
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
  addUserFn: TestContext["addUser"],
): Promise<PublicUser> {
  return addUserFn("admin", "password123", true);
}

export async function seedRegularUser(
  addUserFn: TestContext["addUser"],
  username = "alice",
): Promise<PublicUser> {
  return addUserFn(username, "password123", false);
}

export { request };
