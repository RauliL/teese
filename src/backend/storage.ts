import { createCacheStorage } from "@varasto/cache-storage";
import { createFileSystemStorage } from "@varasto/fs-storage";
import { createMultiStorage } from "@varasto/multi-storage";
import type { Storage } from "@varasto/storage";
import { USERS_NAMESPACE } from "express-varasto-jwt-auth";
import path from "node:path";

const DEFAULT_DATA_DIR = path.resolve(import.meta.dirname, "..", "..", "data");

/**
 * Builds the application storage, optionally routing authentication data to a
 * separate backend. When `authStorage` is omitted, all namespaces share
 * `dataStorage` (the default).
 */
export const createApplicationStorage = (
  dataStorage: Storage,
  authStorage?: Storage,
): Storage =>
  authStorage
    ? createMultiStorage({
        [USERS_NAMESPACE]: authStorage,
        "*": dataStorage,
      })
    : dataStorage;

const backend =
  process.env.NODE_ENV === "test"
    ? (await import("@varasto/memory-storage")).createMemoryStorage()
    : createApplicationStorage(
        createFileSystemStorage({
          dir: process.env.TEESE_DATA || DEFAULT_DATA_DIR,
        }),
        process.env.TEESE_AUTH_DATA
          ? createFileSystemStorage({ dir: process.env.TEESE_AUTH_DATA })
          : undefined,
      );

export const storage = createCacheStorage(
  backend,
  // 15 minutes in milliseconds.
  900000,
);
