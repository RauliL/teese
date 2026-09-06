// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import {
  login,
  request,
  seedAdmin,
  seedRegularUser,
  setupBackendTest,
  withAuth,
  type TestContext,
} from "../test/helpers.js";

describe("users API", () => {
  let context: TestContext;
  let adminToken: string;

  beforeEach(async () => {
    context = await setupBackendTest();
    await seedAdmin(context.createUser);
    adminToken = await login(context.app, "admin", "password123");
  });

  describe("GET /api/users", () => {
    it("lists users for administrators", async () => {
      await seedRegularUser(context.createUser);

      const response = await withAuth(context.app, adminToken).get(
        "/api/users",
      );

      expect(response.status).toBe(200);
      expect(response.body.users).toEqual([
        { username: "admin", isAdmin: true },
        { username: "alice", isAdmin: false },
      ]);
    });

    it("returns 403 for non-administrators", async () => {
      await seedRegularUser(context.createUser);
      const userToken = await login(context.app, "alice", "password123");

      const response = await withAuth(context.app, userToken).get("/api/users");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Administrator access required.");
    });
  });

  describe("POST /api/users", () => {
    it("creates a user", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/users")
        .send({ username: "bob", password: "password123", isAdmin: false });

      expect(response.status).toBe(201);
      expect(response.body.user).toEqual({
        username: "bob",
        isAdmin: false,
      });
    });

    it("returns 400 when required fields are missing", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/users")
        .send({ username: "bob" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Username and password are required.");
    });

    it("returns 400 for invalid usernames", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/users")
        .send({ username: "Invalid User", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Username must be a valid slug (lowercase letters, numbers, and hyphens).",
      );
    });

    it("returns 400 for duplicate usernames", async () => {
      await withAuth(context.app, adminToken)
        .post("/api/users")
        .send({ username: "bob", password: "password123" });

      const response = await withAuth(context.app, adminToken)
        .post("/api/users")
        .send({ username: "bob", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Username is already taken.");
    });
  });

  describe("DELETE /api/users/:username", () => {
    it("deletes another user", async () => {
      await seedRegularUser(context.createUser);

      const response = await withAuth(context.app, adminToken).delete(
        "/api/users/alice",
      );

      expect(response.status).toBe(204);

      const listResponse = await withAuth(context.app, adminToken).get(
        "/api/users",
      );
      expect(listResponse.body.users).toEqual([
        { username: "admin", isAdmin: true },
      ]);
    });

    it("returns 400 when deleting your own account", async () => {
      const response = await withAuth(context.app, adminToken).delete(
        "/api/users/admin",
      );

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You cannot delete your own account.");
    });

    it("returns 404 for unknown users", async () => {
      const response = await withAuth(context.app, adminToken).delete(
        "/api/users/missing",
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found.");
    });
  });
});
