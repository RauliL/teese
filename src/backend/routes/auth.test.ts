// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import {
  login,
  request,
  seedAdmin,
  setupBackendTest,
  withAuth,
  type TestContext,
} from "../test/helpers.js";

describe("auth API", () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await setupBackendTest();
    await seedAdmin(context.createUser);
  });

  describe("POST /api/auth/login", () => {
    it("returns a token and user for valid credentials", async () => {
      const response = await request(context.app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.user).toEqual({
        username: "admin",
        isAdmin: true,
      });
    });

    it("returns 400 when username or password is missing", async () => {
      const response = await request(context.app)
        .post("/api/auth/login")
        .send({ username: "admin" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Username and password are required.");
    });

    it("returns 401 for invalid credentials", async () => {
      const response = await request(context.app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "wrong-password" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid username or password.");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the current user when authenticated", async () => {
      const token = await login(context.app, "admin", "password123");

      const response = await withAuth(context.app, token).get("/api/auth/me");

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        username: "admin",
        isAdmin: true,
      });
    });

    it("returns 401 without a token", async () => {
      const response = await request(context.app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Authentication required.");
    });

    it("returns 401 for an invalid token", async () => {
      const response = await withAuth(context.app, "invalid-token").get(
        "/api/auth/me",
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid or expired token.");
    });
  });
});
