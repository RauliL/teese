import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiFetch,
  getStoredToken,
  setStoredToken,
} from "./client.js";

describe("ApiError", () => {
  it("stores status and message", () => {
    const error = new ApiError(404, "Not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
  });
});

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no token is stored", () => {
    expect(getStoredToken()).toBeNull();
  });

  it("stores and retrieves a token", () => {
    setStoredToken("abc123");
    expect(getStoredToken()).toBe("abc123");
  });

  it("removes the token when set to null", () => {
    setStoredToken("abc123");
    setStoredToken(null);
    expect(getStoredToken()).toBeNull();
  });
});

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    await expect(apiFetch("/api/test")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      headers: expect.any(Headers),
    });
  });

  it("adds Authorization header when a token is stored", async () => {
    setStoredToken("secret-token");
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch("/api/test");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer secret-token");
  });

  it("sets Content-Type for JSON request bodies", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch("/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not override an existing Content-Type header", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch("/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
      headers: { "Content-Type": "text/plain" },
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get("Content-Type")).toBe("text/plain");
  });

  it("throws ApiError with server error message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    });

    await expect(apiFetch("/api/test")).rejects.toEqual(
      new ApiError(401, "Invalid credentials"),
    );
  });

  it("throws ApiError with default message when response has no error field", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(apiFetch("/api/test")).rejects.toEqual(
      new ApiError(500, "Request failed."),
    );
  });

  it("handles non-JSON error responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    await expect(apiFetch("/api/test")).rejects.toEqual(
      new ApiError(502, "Request failed."),
    );
  });
});
