import express from "express";
import {
  authRouter,
  requireAdmin,
  requireAuth,
} from "express-varasto-jwt-auth";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

import boardsRouter from "./routes/boards.js";
import myBoardsRouter from "./routes/my-boards.js";
import usersRouter from "./routes/users.js";
import { storage } from "./storage.js";

const app = express();
const publicDir = path.resolve(import.meta.dirname, "../../public");

// Only setup logging when not running test cases.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(express.json());

if (!fs.existsSync(path.join(import.meta.dirname, "client"))) {
  app.use(express.static(publicDir));
}

// Ensure JSON body is always an object before the auth router reads it.
app.use("/api/auth", (req, _res, next) => {
  req.body ??= {};
  next();
});
app.use("/api/auth", authRouter(storage));
app.use("/api/my/boards", requireAuth, myBoardsRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);
app.use("/api/boards", requireAuth, requireAdmin, boardsRouter);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API endpoint not found." });
    return;
  }

  next();
});

export default app;
