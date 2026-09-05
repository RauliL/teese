import { Router } from "express";
import type { CreateUserRequest } from "../../types.js";
import { createUser, listUsers, UserValidationError } from "../users.js";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await listUsers();
  res.json({ users });
});

router.post("/", async (req, res) => {
  const body = req.body as Partial<CreateUserRequest>;

  if (!body.username || !body.password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  try {
    const user = await createUser({
      username: body.username,
      password: body.password,
      isAdmin: body.isAdmin ?? false,
    });
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof UserValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    throw error;
  }
});

export default router;
