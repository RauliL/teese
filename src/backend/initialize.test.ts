// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { InitializeError, validateInitializeInput } from "./initialize.js";

describe("initialize", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = "test";
  });

  describe("validateInitializeInput", () => {
    it("accepts valid input", () => {
      expect(
        validateInitializeInput({
          username: "admin",
          password: "password123",
          boardName: "Team board",
        }),
      ).toEqual({
        username: "admin",
        password: "password123",
        boardName: "Team board",
      });
    });

    it("rejects invalid usernames", () => {
      expect(() =>
        validateInitializeInput({
          username: "Admin",
          password: "password123",
          boardName: "Team board",
        }),
      ).toThrow(InitializeError);
    });

    it("rejects short passwords", () => {
      expect(() =>
        validateInitializeInput({
          username: "admin",
          password: "short",
          boardName: "Team board",
        }),
      ).toThrow("Password must be at least 8 characters.");
    });

    it("rejects empty board names", () => {
      expect(() =>
        validateInitializeInput({
          username: "admin",
          password: "password123",
          boardName: "   ",
        }),
      ).toThrow("Board name is required.");
    });
  });

  describe("initializeApplication", () => {
    it("creates the admin user and initial board", async () => {
      const { initializeApplication: initialize } =
        await import("./initialize.js");

      const result = await initialize({
        username: "admin",
        password: "password123",
        boardName: "First board",
      });

      expect(result.user).toEqual({
        username: "admin",
        isAdmin: true,
      });
      expect(result.board.name).toBe("First board");
      expect(result.board.items).toEqual([]);
      expect(result.board.allowedUsers).toEqual([]);
    });

    it("refuses to run when users already exist", async () => {
      const { createUser } = await import("./users.js");
      const { initializeApplication: initialize } =
        await import("./initialize.js");

      await createUser({
        username: "existing",
        password: "password123",
        isAdmin: true,
      });

      await expect(
        initialize({
          username: "admin",
          password: "password123",
          boardName: "Another board",
        }),
      ).rejects.toThrow("Teese is already initialized.");
    });
  });
});
