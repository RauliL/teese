import { Router } from "express";
import type { CreateUserRequest } from "../../types.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import {
  createUser,
  deleteUser,
  listUsers,
  UserNotFoundError,
  UserValidationError,
} from "../users.js";

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

router.delete("/:username", async (req, res) => {
  const targetUsername = req.params.username;
  const { username: currentUsername } = (req as AuthenticatedRequest).user;

  if (targetUsername === currentUsername) {
    res.status(400).json({ error: "You cannot delete your own account." });
    return;
  }

  try {
    await deleteUser(targetUsername);
    res.status(204).send();
  } catch (error) {
    if (error instanceof UserValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error instanceof UserNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    throw error;
  }
});

export default router;
