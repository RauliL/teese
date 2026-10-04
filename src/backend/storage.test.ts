// @vitest-environment node
import { createMemoryStorage } from "@varasto/memory-storage";
import { USERS_NAMESPACE } from "express-varasto-jwt-auth";
import { describe, expect, it } from "vitest";

import { BOARDS_NAMESPACE } from "./boards.js";
import { createApplicationStorage } from "./storage.js";

describe("createApplicationStorage", () => {
  it("uses a single storage for all namespaces by default", async () => {
    const dataStorage = createMemoryStorage();
    const storage = createApplicationStorage(dataStorage);

    await storage.set(USERS_NAMESPACE, "admin", { username: "admin" });
    await storage.set(BOARDS_NAMESPACE, "board-1", { name: "Board" });

    expect(await dataStorage.get(USERS_NAMESPACE, "admin")).toEqual({
      username: "admin",
    });
    expect(await dataStorage.get(BOARDS_NAMESPACE, "board-1")).toEqual({
      name: "Board",
    });
  });

  it("routes authentication data to a separate storage when configured", async () => {
    const dataStorage = createMemoryStorage();
    const authStorage = createMemoryStorage();
    const storage = createApplicationStorage(dataStorage, authStorage);

    await storage.set(USERS_NAMESPACE, "admin", { username: "admin" });
    await storage.set(BOARDS_NAMESPACE, "board-1", { name: "Board" });

    expect(await authStorage.get(USERS_NAMESPACE, "admin")).toEqual({
      username: "admin",
    });
    expect(await dataStorage.get(USERS_NAMESPACE, "admin")).toBeUndefined();

    expect(await dataStorage.get(BOARDS_NAMESPACE, "board-1")).toEqual({
      name: "Board",
    });
    expect(await authStorage.get(BOARDS_NAMESPACE, "board-1")).toBeUndefined();

    expect(await storage.get(USERS_NAMESPACE, "admin")).toEqual({
      username: "admin",
    });
    expect(await storage.get(BOARDS_NAMESPACE, "board-1")).toEqual({
      name: "Board",
    });
  });
});
