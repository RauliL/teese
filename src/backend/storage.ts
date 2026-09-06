import { createCacheStorage } from "@varasto/cache-storage";
import { createFileSystemStorage } from "@varasto/fs-storage";
import path from "node:path";

export const USERS_NAMESPACE = "users";

const backend =
  process.env.NODE_ENV === "test"
    ? (await import("@varasto/memory-storage")).createMemoryStorage()
    : createFileSystemStorage({
        dir:
          process.env.TEESE_DATA ||
          path.resolve(import.meta.dirname, "..", "..", "data"),
      });

export const storage = createCacheStorage(
  backend,
  // 15 minutes in milliseconds.
  900000,
);
