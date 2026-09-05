import { Router } from "express";
import type {
  CreateCommentRequest,
  CreateItemRequest,
  UpdateItemRequest,
} from "../../types.js";
import {
  addItemCommentWithAccess,
  BoardAccessDeniedError,
  BoardNotFoundError,
  BoardValidationError,
  createItemWithAccess,
  deleteItemWithAccess,
  getAccessibleBoard,
  ItemNotFoundError,
  listAccessibleBoards,
  updateItemWithAccess,
} from "../boards.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

function handleBoardError(
  error: unknown,
  res: import("express").Response,
): boolean {
  if (error instanceof BoardValidationError) {
    res.status(400).json({ error: error.message });
    return true;
  }

  if (error instanceof BoardAccessDeniedError) {
    res.status(403).json({ error: error.message });
    return true;
  }

  if (error instanceof BoardNotFoundError) {
    res.status(404).json({ error: error.message });
    return true;
  }

  if (error instanceof ItemNotFoundError) {
    res.status(404).json({ error: error.message });
    return true;
  }

  return false;
}

router.get("/", async (req, res) => {
  const { username, isAdmin } = (req as AuthenticatedRequest).user;
  const boards = await listAccessibleBoards(username, isAdmin);
  res.json({ boards });
});

router.get("/:id", async (req, res) => {
  const { username, isAdmin } = (req as AuthenticatedRequest).user;

  try {
    const board = await getAccessibleBoard(req.params.id, username, isAdmin);
    res.json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.post("/:boardId/items", async (req, res) => {
  const body = req.body as Partial<CreateItemRequest>;
  const { username, isAdmin } = (req as AuthenticatedRequest).user;

  try {
    const board = await createItemWithAccess(
      req.params.boardId,
      {
        title: body.title ?? "",
        status: body.status,
      },
      username,
      isAdmin,
    );
    res.status(201).json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.patch("/:boardId/items/:itemId", async (req, res) => {
  const body = req.body as UpdateItemRequest;
  const { username, isAdmin } = (req as AuthenticatedRequest).user;

  try {
    const board = await updateItemWithAccess(
      req.params.boardId,
      req.params.itemId,
      body,
      username,
      isAdmin,
    );
    res.json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.delete("/:boardId/items/:itemId", async (req, res) => {
  const { username, isAdmin } = (req as AuthenticatedRequest).user;

  try {
    const board = await deleteItemWithAccess(
      req.params.boardId,
      req.params.itemId,
      username,
      isAdmin,
    );
    res.json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.post("/:boardId/items/:itemId/comments", async (req, res) => {
  const body = req.body as Partial<CreateCommentRequest>;
  const { username, isAdmin } = (req as AuthenticatedRequest).user;

  try {
    const board = await addItemCommentWithAccess(
      req.params.boardId,
      req.params.itemId,
      body.text ?? "",
      username,
      isAdmin,
    );
    res.status(201).json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

export default router;
