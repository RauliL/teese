import express from "express";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin, requireAuth } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import boardsRouter from "./routes/boards.js";
import myBoardsRouter from "./routes/my-boards.js";
import usersRouter from "./routes/users.js";

const app = express();

// Only setup logging when not running test cases.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(express.json());

const publicDir = path.resolve(import.meta.dirname, "../../public");
if (!fs.existsSync(path.join(import.meta.dirname, "client"))) {
  app.use(express.static(publicDir));
}

app.use("/api/auth", authRouter);
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
