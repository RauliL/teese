import express from "express";
import morgan from "morgan";
import { requireAdmin, requireAuth } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import { bootstrapAdminIfNeeded } from "./users.js";

const app = express();

app.use(morgan("combined"));
app.use(express.json());

await bootstrapAdminIfNeeded();

app.use("/api/auth", authRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API endpoint not found." });
    return;
  }

  next();
});

export default app;
