import { Router } from "express";
import {
  AuthenticatedRequest,
  UserNotFoundError,
  UserValidationError,
  addUser,
  deleteUser,
  listUsers,
} from "express-varasto-jwt-auth";

import { storage } from "../storage.js";
import { removeUserFromBoardAccessLists } from "../users.js";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({ users: await listUsers(storage) });
});

router.post("/", async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  try {
    res.status(201).json({
      user: await addUser(storage, username, password, isAdmin ?? false),
    });
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
    await deleteUser(storage, targetUsername);
    await removeUserFromBoardAccessLists(targetUsername);
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
