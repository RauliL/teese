import { Router } from "express";
import type { LoginRequest } from "../../types.js";
import { signAuthToken } from "../jwt.js";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { getUser, toPublicUser, verifyUserPassword } from "../users.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as Partial<LoginRequest>;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  const user = await getUser(username);

  if (!user || !(await verifyUserPassword(user, password))) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }

  const token = await signAuthToken({
    sub: user.username,
    isAdmin: user.isAdmin,
  });

  res.json({
    token,
    user: toPublicUser(user),
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const { username } = (req as AuthenticatedRequest).user;
  const user = await getUser(username);

  if (!user) {
    res.status(401).json({ error: "User no longer exists." });
    return;
  }

  res.json({ user: toPublicUser(user) });
});

export default router;
