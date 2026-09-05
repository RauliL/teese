import { createCacheStorage } from "@varasto/cache-storage";
import { createFileSystemStorage } from "@varasto/fs-storage";
import path from "node:path";

export const USERS_NAMESPACE = "users";

export const storage = createCacheStorage(
  createFileSystemStorage({
    dir:
      process.env.TEESE_DATA ||
      path.resolve(import.meta.dirname, "..", "..", "data"),
  }),
  // 15 minutes in milliseconds.
  900000,
);
