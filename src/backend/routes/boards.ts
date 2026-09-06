import { Router } from "express";
import type {
  CreateBoardRequest,
  CreateCommentRequest,
  CreateItemRequest,
  UpdateBoardRequest,
  UpdateItemRequest,
} from "../../types.js";
import {
  addItemComment,
  BoardNotFoundError,
  BoardValidationError,
  createBoard,
  createItem,
  deleteBoard,
  deleteItem,
  getBoard,
  ItemNotFoundError,
  listBoardSummaries,
  updateBoard,
  updateItem,
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

router.get("/", async (_req, res) => {
  const boards = await listBoardSummaries();
  res.json({ boards });
});

router.post("/", async (req, res) => {
  const body = req.body as Partial<CreateBoardRequest>;

  try {
    const board = await createBoard({
      name: body.name ?? "",
      allowedUsers: body.allowedUsers,
    });
    res.status(201).json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.get("/:id", async (req, res) => {
  const board = await getBoard(req.params.id);

  if (!board) {
    res.status(404).json({ error: "Board not found." });
    return;
  }

  res.json({ board });
});

router.patch("/:id", async (req, res) => {
  const body = req.body as UpdateBoardRequest;

  try {
    const board = await updateBoard(req.params.id, body);
    res.json({ board });
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteBoard(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (handleBoardError(error, res)) {
      return;
    }

    throw error;
  }
});

router.post("/:boardId/items", async (req, res) => {
  const body = req.body as Partial<CreateItemRequest>;
  const { username } = (req as AuthenticatedRequest).user;

  try {
    const board = await createItem(
      req.params.boardId,
      {
        title: body.title ?? "",
        status: body.status,
      },
      username,
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
  const { username } = (req as AuthenticatedRequest).user;

  try {
    const board = await updateItem(
      req.params.boardId,
      req.params.itemId,
      body,
      username,
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
  try {
    const board = await deleteItem(req.params.boardId, req.params.itemId);
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
  const { username } = (req as AuthenticatedRequest).user;

  try {
    const board = await addItemComment(
      req.params.boardId,
      req.params.itemId,
      body.text ?? "",
      username,
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
