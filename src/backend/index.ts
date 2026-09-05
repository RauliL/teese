import { createCacheStorage } from "@varasto/cache-storage";
import { createFileSystemStorage } from "@varasto/fs-storage";
import express from "express";
import morgan from "morgan";
import path from "node:path";

const app = express();
const storage = createCacheStorage(
  createFileSystemStorage({
    dir: process.env.TEESE_DATA || path.resolve(import.meta.dirname, "..", "data"),
  }),
  // 15 minutes in milliseconds.
  900000,
);

app.use(morgan("combined"));
app.use(express.json());

export default app;
