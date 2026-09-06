import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearPostLoginRedirect,
  resolvePostLoginRedirect,
  savePostLoginRedirect,
} from "./postLoginRedirect.js";

describe("postLoginRedirect", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("stores and resolves an internal path", () => {
    savePostLoginRedirect("/boards/board-1");

    expect(resolvePostLoginRedirect()).toBe("/boards/board-1");
    expect(localStorage.getItem("teese.postLoginRedirect")).toBeNull();
  });

  it("prefers stored path over fallback", () => {
    savePostLoginRedirect("/boards/board-1");

    expect(resolvePostLoginRedirect("/admin")).toBe("/boards/board-1");
  });

  it("uses fallback when nothing is stored", () => {
    expect(resolvePostLoginRedirect("/boards/board-2")).toBe(
      "/boards/board-2",
    );
  });

  it("defaults to home for invalid paths", () => {
    savePostLoginRedirect("/login");
    savePostLoginRedirect("//evil.example");

    expect(resolvePostLoginRedirect()).toBe("/");
    expect(resolvePostLoginRedirect("/login")).toBe("/");
  });

  it("clears stored redirect", () => {
    savePostLoginRedirect("/boards/board-1");
    clearPostLoginRedirect();

    expect(resolvePostLoginRedirect()).toBe("/");
  });
});
