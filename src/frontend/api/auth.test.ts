import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicUser } from "../../types.js";
import {
  createUser,
  deleteUser,
  getCurrentUser,
  listUsers,
  login,
} from "./auth.js";
import { mockFetch } from "./testHelpers.js";

const mockUser: PublicUser = {
  username: "alice",
  isAdmin: false,
};

describe("auth API", () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("login", () => {
    it("posts credentials and returns token and user", async () => {
      const response = { token: "jwt-token", user: mockUser };
      fetchMock = mockFetch(response);

      await expect(
        login({ username: "alice", password: "secret" }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "secret" }),
        headers: expect.any(Headers),
      });
    });
  });

  describe("getCurrentUser", () => {
    it("fetches the current user", async () => {
      const response = { user: mockUser };
      fetchMock = mockFetch(response);

      await expect(getCurrentUser()).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("createUser", () => {
    it("creates a user with required fields", async () => {
      const response = { user: mockUser };
      fetchMock = mockFetch(response);

      await expect(
        createUser({ username: "alice", password: "secret" }),
      ).resolves.toEqual(response);

      expect(fetchMock).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "secret" }),
        headers: expect.any(Headers),
      });
    });

    it("creates an admin user when isAdmin is true", async () => {
      const adminUser: PublicUser = { username: "bob", isAdmin: true };
      fetchMock = mockFetch({ user: adminUser });

      await expect(
        createUser({ username: "bob", password: "secret", isAdmin: true }),
      ).resolves.toEqual({ user: adminUser });

      expect(fetchMock).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        body: JSON.stringify({
          username: "bob",
          password: "secret",
          isAdmin: true,
        }),
        headers: expect.any(Headers),
      });
    });
  });

  describe("listUsers", () => {
    it("fetches all users", async () => {
      const response = { users: [mockUser] };
      fetchMock = mockFetch(response);

      await expect(listUsers()).resolves.toEqual(response);
      expect(fetchMock).toHaveBeenCalledWith("/api/users", {
        headers: expect.any(Headers),
      });
    });
  });

  describe("deleteUser", () => {
    it("deletes a user by username", async () => {
      fetchMock = mockFetch({});

      await expect(deleteUser("alice")).resolves.toEqual({});
      expect(fetchMock).toHaveBeenCalledWith("/api/users/alice", {
        method: "DELETE",
        headers: expect.any(Headers),
      });
    });

    it("encodes special characters in the username", async () => {
      fetchMock = mockFetch({});

      await deleteUser("user/name");
      expect(fetchMock).toHaveBeenCalledWith("/api/users/user%2Fname", {
        method: "DELETE",
        headers: expect.any(Headers),
      });
    });
  });
});
